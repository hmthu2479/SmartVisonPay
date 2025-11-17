import {useState, type ChangeEvent } from "react";
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
  TextField,
} from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import DeleteIcon from "@mui/icons-material/Delete";
import { useCustomerStore } from "../store/useCustomer";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

export default function Customer() {
  const {
    customers,
    addCustomer,
    deleteCustomer,
    updateCustomer,
    searchCustomers
  } = useCustomerStore();
  const columns: GridColDef[] = [
    { field: "name", headerName: "Tên khách hàng", flex: 2, editable: true },
    { field: "phone", headerName: "Số điện thoại", flex: 1.5 },
    {
      field: "points",
      headerName: "Điểm tích lũy",
      flex: 1,
      type: "number",
    },
  ];
  const paginationModel = { page: 0, pageSize: 7 };

  // selection
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>({ type: "include", ids: new Set() });

  // add modal
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleAdd = () => {
    addCustomer(name, phone);
    setOpen(false);
    setName("");
    setPhone("");
  };

  const handleDelete = () => {
    if (rowSelectionModel.type === "include") {
      if (rowSelectionModel.ids.size > 0) {
        deleteCustomer(Array.from(rowSelectionModel.ids) as string[]);
      }
    } else if (rowSelectionModel.type === "exclude") {
      const allRowIds = customers.map((row) => row._id);
      const rowsToDelete = allRowIds.filter(
        (id) => !rowSelectionModel.ids.has(id)
      );
      deleteCustomer(rowsToDelete as string[]);
    }
  };
  const [query, setQuery] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    searchCustomers(value);
  };
  return (
    <div>
      <div className="flex flex-row justify-between mb-4 mx-4">
        {/* Action buttons */}
        <div className="flex flex-row gap-4">
          <Button
            variant="contained"
            endIcon={<AddBoxIcon />}
            onClick={() => setOpen(true)}
          >
            Thêm khách hàng
          </Button>
          <Button
            variant="outlined"
            color="error"
            endIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Xóa khách hàng
          </Button>
        </div>
        <FormControl variant="outlined">
          <Input
            id="input-with-icon-adornment"
            placeholder="Tìm kiếm khách hàng"
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
          rows={customers}
          getRowId={(row) => row._id}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={setRowSelectionModel}
          processRowUpdate={async (newRow, oldRow) => {
            try {
              await updateCustomer(newRow._id, newRow.name, newRow.points);
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
        <DialogTitle>Thêm khách hàng</DialogTitle>
        <DialogContent className="flex flex-col gap-4 !pt-2 w-80">
          <TextField
            label="Tên khách hàng"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Số điện thoại"
            fullWidth
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained" type="submit">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
