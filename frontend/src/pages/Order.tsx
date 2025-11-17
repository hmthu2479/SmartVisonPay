import { useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import type { Transaction } from "../models/transaction";
import { useTransactionStore } from "../store/useTransaction";
import DescriptionIcon from "@mui/icons-material/Description";

// Currency formatter
const currencyFormat = (value: number) =>
  (value * 1000).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Order() {
  const [open, setOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const { transactions, getTransactionById } = useTransactionStore();

  const handleOpen = async (transactionId: string) => {
    const data = await getTransactionById(transactionId);
    setSelectedTransaction(data);
    setOpen(true);
  };
  const handleClose = () => {
    setSelectedTransaction(null);
    setOpen(false);
  };

  const columns: GridColDef<Transaction>[] = [
    {
      field: "code",
      headerName: "Bill Code",
      flex: 1,
    },
    {
      field: "store",
      headerName: "Cửa hàng",
      flex: 1.2,
    },
    {
      field: "kiosk",
      headerName: "Kiosk Code",
      flex: 1.2,
    },
    {
      field: "customer",
      headerName: "Khách",
      flex: 1.2,
      renderCell: (params) => params.row.customer ?? "Khách",
    },
    {
      field: "totalAmount",
      headerName: "Tổng tiền",
      flex: 1,
      valueFormatter: (params) => {
        const value = Number(params);
        return (value * 1000).toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        });
      },
    },
    {
      field: "dateTime",
      headerName: "Ngày tạo",
      flex: 1.5,
      valueFormatter: (params) => {
        return formatDateTime(params);
      },
    },
    {
      field: "status",
      headerName: "Trạng thái",
      flex: 1,
      renderCell: (params) => {
        const status = params.value?.toLowerCase();

        const color =
          status === "success"
            ? "green"
            : status === "failed"
            ? "red"
            : "inherit";

        return (
          <span
            style={{
              fontWeight: "bold",
              color: color,
            }}
          >
            {params.value}
          </span>
        );
      },
    },

    {
      field: "actions",
      headerName: "",
      flex: 0.8,
      sortable: false,
      renderCell: (params) => (
        <Button size="small" onClick={() => handleOpen(params.row._id!)}>
          <DescriptionIcon />
        </Button>
      ),
    },
  ];

  const paginationModel = { page: 0, pageSize: 8 };

  return (
    <div className="">
      <Paper sx={{ height: "100%", width: "100%" }}>
        <DataGrid
          rows={transactions}
          getRowId={(row) => row.code ?? row._id!}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10]}
          sx={{ border: 0 }}
          className="px-2 !rounded-xl shadow-xs"
        />
      </Paper>

      {/* Detail Dialog */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        {selectedTransaction && (
          <>
            <DialogTitle className="font-bold">
              Bill #{selectedTransaction.code}
            </DialogTitle>
            <DialogContent>
              {/* Header Info */}
              <Box className="mb-4 space-y-1">
                <p>
                  <b>Khách:</b> {selectedTransaction.customer ?? "Khách"}
                </p>
                <p>
                  <b>Cửa hàng:</b> {selectedTransaction.store}
                </p>
                <p>
                  <b>Kiosk:</b> {selectedTransaction.kiosk}
                </p>
                <p>
                  <b>Ngày:</b> {formatDateTime(selectedTransaction.dateTime)}
                </p>
              </Box>

              {/* Products */}
              <Table size="medium" className="auto-overflow">
                <TableHead>
                  <TableRow>
                    <TableCell>Sản phẩm</TableCell>
                    <TableCell align="right">SL</TableCell>
                    <TableCell align="right">Giá</TableCell>
                    <TableCell align="right">Tạm tính</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedTransaction.products.map((p, i) => (
                    <TableRow key={i}>
                      <TableCell>{p.name}</TableCell>
                      <TableCell align="right">{p.quantity}</TableCell>
                      <TableCell align="right">
                        {currencyFormat(p.price)}
                      </TableCell>
                      <TableCell align="right">
                        {currencyFormat(p.price * p.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Discount row */}
                  {selectedTransaction.discount !== 0 &&
                    selectedTransaction.discount && (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          align="right"
                          className="text-red-600"
                        >
                          Giảm giá
                        </TableCell>
                        <TableCell align="right" className="text-red-600">
                          -{currencyFormat(selectedTransaction.discount)}
                        </TableCell>
                      </TableRow>
                    )}

                  {/* Total row */}
                  <TableRow>
                    <TableCell colSpan={3} align="right" className="font-bold">
                      Thành tiền
                    </TableCell>
                    <TableCell align="right" className="font-bold">
                      {currencyFormat(selectedTransaction.totalAmount)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </DialogContent>
          </>
        )}
      </Dialog>
    </div>
  );
}
