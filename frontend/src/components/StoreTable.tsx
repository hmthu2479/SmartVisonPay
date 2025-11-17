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
  TextField,
} from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import DeleteIcon from "@mui/icons-material/Delete";
import type { StoreDB } from "../models/store";
import { useShopStore } from "../store/useStore";
import { useState } from "react";

const columns: GridColDef[] = [
  {
    field: "address",
    headerName: "Địa chỉ",
    flex: 1,
    editable: true,
  },
];

const paginationModel = { page: 0, pageSize: 4 };

export default function StoreTable({ stores }: StoreDB) {
  const { addShop, deleteShop, updateShop } = useShopStore();
  const [address, setAddress] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);

  const handleAdd = async () => {
    if (!address.trim()) {
      setError(true);
      return;
    }
    addShop(address.trim());
    setOpen(false);
    setAddress("");
  };
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>({ type: "include", ids: new Set() });

  const handleRowSelectionModelChange = (
    newRowSelectionModel: GridRowSelectionModel
  ) => {
    setRowSelectionModel(newRowSelectionModel);
  };

  const handleDelete = () => {
    if (rowSelectionModel.ids.size > 0) {
      deleteShop(Array.from(rowSelectionModel.ids) as string[]);
    }
  };
  return (
    <div className="mt-4">
      <div className="flex flex-row gap-4 mb-4 ml-4">
        <Button
          variant="contained"
          endIcon={<AddBoxIcon />}
          onClick={() => setOpen(true)}
        >
          Thêm cửa hàng
        </Button>
        <Button
          variant="outlined"
          endIcon={<DeleteIcon />}
          onClick={handleDelete}
        >
          Xóa
        </Button>
      </div>
      <Paper sx={{ height: 300, width: "100%" }}>
        <DataGrid
          rows={stores}
          getRowId={(row) => row._id}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[2, 3]}
          checkboxSelection
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={handleRowSelectionModelChange}
          processRowUpdate={async (newRow, oldRow) => {
            try {
              await updateShop(newRow._id, newRow.address.trim());
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
      {/* Modal */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        component="form"
        onSubmit={(e) => {
          e.preventDefault(); // prevent page reload
          handleAdd();
        }}
      >
        <DialogTitle>Add New Store</DialogTitle>
        <DialogContent className="flex flex-col gap-4 !pt-2 px-5 w-80">
          <TextField
            label="Address"
            fullWidth
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            error={error}
            helperText={error ? "Address is required" : ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained" type="submit">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
