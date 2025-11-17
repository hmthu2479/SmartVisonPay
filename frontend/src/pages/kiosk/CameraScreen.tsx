import { useEffect, useRef, useState } from "react";
import { useCustomerStore } from "../../store/useCustomer";
import { useNavigate } from "react-router-dom";
import { useProductStore } from "../../store/useProduct";
import { useKioskStore } from "../../store/useKiosk";

export default function CameraScreen() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const { customerGetByPhone } = useCustomerStore();
  const navigate = useNavigate();
  const { fetchProductsByName } = useProductStore();
  const { kioskGetByCode } = useKioskStore();

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current
              ?.play()
              .catch((err) => console.warn("Play() failed:", err));
          };
        }
      } catch (err: any) {
        setError(`Lỗi camera: ${err.name} - ${err.message}`);
      }
    };

    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      setIsScanning(true);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Không thể lấy context canvas");

      // Set canvas size bằng video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Vẽ khung hình hiện tại từ webcam lên canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Chuyển canvas -> base64
      const base64Image = canvas.toDataURL("image/jpeg");

      // Gửi lên AI API
      const res = await fetch("http://localhost:5001/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!res.ok) throw new Error("AI server error");

      const data = await res.json();
      console.log("Products detected:", data.products);

      if (!kioskGetByCode?.store?._id) {
        console.error("Missing store ID");
        return;
      }

      // Gọi API backend của bạn để lấy dữ liệu sản phẩm theo tên
      await fetchProductsByName(data.products, kioskGetByCode.store._id);

      // Chuyển sang trang hiển thị hóa đơn
      navigate("/kiosk/extracted-bill");
    } catch (err: any) {
      console.error("Scan error:", err);
      setError(err.message || "Lỗi khi quét món");
    } finally {
      setTimeout(() => setIsScanning(false), 1500);
    }
  };

  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center bg-gradient-to-br from-[#2868c7] via-[#3a8ee2] to-[#6ebaf9] text-white overflow-hidden">
      {/* Header */}
      <div className="absolute top-8 text-center">
        <h1 className="text-center text-5xl font-extrabold text-white drop-shadow-md transition-all duration-500">
          Smart<span className="text-yellow-400">Vision</span>Pay
        </h1>
        <p className="mt-2 text-lg text-gray-200 font-bold">
          Xin chào
          {customerGetByPhone && (
            <span className="font-semibold text-white text-xl">
              , {customerGetByPhone?.name || "Guest"}
            </span>
          )}{" "}
          !!
        </p>
      </div>

      {/* Camera Wrapper */}
      <div className="relative w-full max-w-3xl aspect-[2/1.1] rounded-3xl overflow-hidden shadow-2xl border border-white/20 mt-30">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />

        {/* Overlay when scanning */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <p className="text-2xl font-bold text-white animate-pulse">
              Đang nhận diện món...
            </p>
          </div>
        )}
      </div>

      {/* Start Button */}
      {!isScanning && (
        <button
          onClick={handleScan}
          className="mt-3 bg-yellow-400 text-blue-900 font-bold px-8 py-3 rounded-full shadow-lg hover:bg-yellow-300 transition-all duration-300"
        >
          Bắt đầu quét món
        </button>
      )}

      {/* Hidden canvas for capturing frame */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-red-400 text-center px-6">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
