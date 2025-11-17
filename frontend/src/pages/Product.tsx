import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import {
  DataGrid,
  type GridColDef,
  type GridRowSelectionModel,
} from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Input,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import DeleteIcon from "@mui/icons-material/Delete";
import { useProductStore } from "../store/useProduct";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import type { Product } from "../models/product";
import { useShopStore } from "../store/useStore";

export default function Product() {
  const {
    products,
    addProduct,
    deleteProduct,
    updateProduct,
    fetchProduct,
    searchProducts,
  } = useProductStore();

  const { stores, fetchShop } = useShopStore();
  // dropdown options for store column
  const storeOptions = useMemo(
    () => stores.map((s) => ({ value: s._id, label: s.address })),
    [stores]
  );
  const columns: GridColDef<Product>[] = [
    {
      field: "name",
      headerName: "Tên sản phẩm",
      editable: true,
      flex: 3,
    },
    {
      field: "price",
      headerName: "Giá (VNĐ)",
      flex: 2,
      editable: true,
      valueFormatter: (params) => {
        const value = Number(params);
        return (value * 1000).toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        });
      },
    },
    {
      field: "quantity",
      editable: true,
      headerName: "Tồn kho",
      flex: 2,
    },
    {
      field: "store",
      headerName: "Cửa hàng",
      flex: 2,
      editable: true,
      type: "singleSelect",
      valueOptions: storeOptions,
      valueGetter: (value, row) => row?.store._id,
      renderCell: (params) => params.row.store?.address ?? "",
    },
  ];
  useEffect(() => {
    fetchProduct();
    fetchShop();
  }, []);
  const paginationModel = { page: 0, pageSize: 7 };

  // selection
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>({ type: "include", ids: new Set() });

  // add modal
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [storeId, setStoreId] = useState("");

  const handleAdd = () => {
    addProduct(name, Number(price), Number(quantity), storeId);
    setOpen(false);
    setName("");
    setPrice("");
    setStoreId("");
  };

  const handleDelete = () => {
    if (rowSelectionModel.type === "include") {
      if (rowSelectionModel.ids.size > 0) {
        deleteProduct(Array.from(rowSelectionModel.ids) as string[]);
      }
    } else if (rowSelectionModel.type === "exclude") {
      const allRowIds = products.map((row) => row._id);
      const rowsToDelete = allRowIds.filter(
        (id) => !rowSelectionModel.ids.has(id)
      );
      deleteProduct(rowsToDelete as string[]);
    }
  };
  const [query, setQuery] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    searchProducts(value);
  };
  return (
    <div className="">
      <div className="flex flex-row justify-between mb-4 mx-4">
        {/* Action buttons */}
        <div className="flex flex-row gap-4">
          <Button
            variant="contained"
            endIcon={<AddBoxIcon />}
            onClick={() => setOpen(true)}
          >
            Thêm sản phẩm
          </Button>
          <Button
            variant="outlined"
            color="error"
            endIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Xóa sản phẩm
          </Button>
        </div>
        <FormControl variant="outlined">
          <Input
            id="input-with-icon-adornment"
            placeholder="Tìm kiếm sản phẩm"
            value={query}
            onChange={handleChange}
            startAdornment={
              <InputAdornment position="start">
                <SearchRoundedIcon />
              </InputAdornment>
            }
          />
        </FormControl>
      </div>

      {/* Table */}
      <Paper sx={{ height: 450, width: "100%" }}>
        <DataGrid
          rows={products}
          getRowId={(row) => row._id}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={setRowSelectionModel}
          processRowUpdate={async (newRow, oldRow) => {
            console.log("🚀 ~ async ~ newRow:", newRow);
            try {
              await updateProduct(
                newRow._id,
                newRow.name,
                newRow.quantity,
                typeof newRow.store === "object"
                  ? newRow.store?._id
                  : newRow.store,
                newRow.price
              );
              return newRow;
            } catch {
              return oldRow;
            }
          }}
          onProcessRowUpdateError={(error) => {
            console.error("Row update error:", error);
          }}
          sx={{ border: 0 }}
          className="px-2 !rounded-xl shadow-xs"
        />
      </Paper>
      {/* Add Modal */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        component="form"
        onSubmit={(e) => {
          e.preventDefault(); // prevent page reload
          handleAdd();
        }}
      >
        <DialogTitle>Thêm sản phẩm</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Tên sản phẩm"
            type="text"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Giá"
            type="number"
            fullWidth
            value={price}
            placeholder="10,20,20.5,..."
            onChange={(e) => setPrice(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Số lượng"
            type="number"
            fullWidth
            value={quantity}
            placeholder="Lượng hàng nhập kho"
            onChange={(e) => setQuantity(e.target.value)}
          />
          <TextField
            select
            label="Cửa hàng"
            fullWidth
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
          >
            {stores.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.address}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Hủy</Button>
          <Button onClick={handleAdd} variant="contained">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
