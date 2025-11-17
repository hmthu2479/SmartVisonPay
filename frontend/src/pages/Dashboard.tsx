import { useEffect } from "react";
import Chart from "../components/Chart";
import KioskTable from "../components/KioskTable";
import Widget from "../components/Widget";
import { useKioskStore } from "../store/useKiosk";
import StoreTable from "../components/StoreTable";
import { useShopStore } from "../store/useStore";

export const Dashboard = () => {
  const { kiosks, fetchKiosk } = useKioskStore();
  const { stores ,fetchShop} = useShopStore();
  useEffect(() => {
    fetchKiosk();
    fetchShop();
  }, []);
  useEffect(() => {
    fetchKiosk();
  }, [stores]);

  return (
    <>
      {/* Main container - scrollable */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6 rounded-md">
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-3">
            <div className="grid md:grid-cols-3 mb-4 gap-3">
              <Widget type="revenue" />
              <Widget type="customer" />
              <Widget type="order" />
            </div>
            <Chart />
          </div>
        </div>

        {/* Table */}
        <StoreTable stores={stores} />
        <KioskTable kiosks={kiosks} stores={stores} />
      </div>
    </>
  );
};
