import { useMemo, useState } from "react";
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
  MenuItem,
} from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Kiosk } from "../models/kiosk";
import { useKioskStore } from "../store/useKiosk";
import type { Store } from "../models/store";

export default function KioskTable({
  kiosks,
  stores,
}: {
  kiosks: Kiosk[];
  stores: Store[];
}) {
  // dropdown options for store column
  const storeOptions = useMemo(
    () => stores.map((s) => ({ value: s._id, label: s.address })),
    [stores]
  );

  const columns: GridColDef[] = [
    {
      field: "store",
      headerName: "Cửa hàng",
      flex: 2,
      editable: true,
      type: "singleSelect",
      valueOptions: storeOptions,
      valueGetter: (value, row) => row?.store?._id,
      renderCell: (params) => params.row.store?.address ?? "",
    },
    { field: "code", headerName: "Code", flex: 1 },
    {
      field: "location",
      headerName: "Vị trí",
      flex: 2,
      editable: true,
    },
  ];

  const paginationModel = { page: 0, pageSize: 4 };
  const { addKiosk, deleteKiosk, updateKiosk } = useKioskStore();
  // modal state
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [storeId, setStoreId] = useState("");

  const handleAdd = async () => {
    if (!storeId) return;
    addKiosk(storeId, location);
    setOpen(false);
    setLocation("");
    setStoreId("");
  };
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>({ type: "include", ids: new Set() });

  const handleRowSelectionModelChange = (
    newRowSelectionModel: GridRowSelectionModel
  ) => {
    setRowSelectionModel(newRowSelectionModel);
  };
  const handleDelete = () => {
    if (rowSelectionModel.type === "include") {
      if (rowSelectionModel.ids.size > 0) {
        deleteKiosk(Array.from(rowSelectionModel.ids) as string[]);
      }
    } else if (rowSelectionModel.type === "exclude") {
      const allRowIds = kiosks.map((row) => row._id);
      console.log("🚀 ~ handleDelete ~ allRowIds:", allRowIds);
      const rowsToDelete = allRowIds.filter(
        (id) => !rowSelectionModel.ids.has(id)
      );
      console.log("🚀 ~ handleDelete ~ rowsToDelete:", rowsToDelete);
      deleteKiosk(rowsToDelete as string[]);
    }
  };

  return (
    <div className="mt-4">
      {/* Action buttons */}
      <div className="flex flex-row gap-4 mb-4 ml-4">
        <Button
          variant="contained"
          endIcon={<AddBoxIcon />}
          onClick={() => setOpen(true)}
        >
          Thêm Kiosk
        </Button>
        <Button
          variant="outlined"
          endIcon={<DeleteIcon />}
          onClick={handleDelete}
        >
          Xóa Kiosk
        </Button>
      </div>

      {/* Table */}
      <Paper sx={{ height: 300, width: "100%" }}>
        <DataGrid
          rows={kiosks}
          getRowId={(row) => row._id}
          columns={columns}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[2, 3]}
          checkboxSelection
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={handleRowSelectionModelChange}
          processRowUpdate={async (newRow, oldRow) => {
            try {
              await updateKiosk(
                newRow._id,
                newRow.store,
                newRow.location.trim()
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
        <DialogTitle className="!pb-0">Add New Kiosk</DialogTitle>
        <DialogContent className="flex flex-col gap-4 !pt-4 w-80">
          <TextField
            label="Location"
            fullWidth
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <TextField
            select
            label="Store"
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
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd} variant="contained" type="submit">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
