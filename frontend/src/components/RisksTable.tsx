import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Switch,
  FormControlLabel,
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Snackbar,
  TablePagination,
  CircularProgress,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {
  GET_RISKS,
  GET_CATEGORIES,
  CREATE_RISK,
  UPDATE_RISK,
  DELETE_RISK,
} from "../graphql/queries";
import { ConfirmDialog } from "./ConfirmDialog";
import { InlineEdit } from "./InlineEdit";

type RiskStatus = "RESOLVED" | "UNRESOLVED";

interface Risk {
  id: string;
  name: string;
  description: string;
  status: RiskStatus;
  createdBy: string;
  createdAt: string;
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export function RisksTable(): JSX.Element {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showResolved, setShowResolved] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    id: string;
    name: string;
  }>({
    open: false,
    id: "",
    name: "",
  });
  const [statusConfirm, setStatusConfirm] = useState<{
    open: boolean;
    risk: Risk | null;
    newStatus: RiskStatus | null;
  }>({
    open: false,
    risk: null,
    newStatus: null,
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
  });

  const { data, loading, error, refetch } = useQuery(GET_RISKS, {
    variables: {
      page: page + 1,
      limit: rowsPerPage,
      showResolved,
      search: search || undefined,
    },
  });

  const { data: categoriesData } = useQuery(GET_CATEGORIES, {
    variables: { page: 1, limit: 100, search: undefined },
  });

  const [createRisk] = useMutation(CREATE_RISK, {
    onCompleted: () => {
      setSnackbar({
        open: true,
        message: "Risk created successfully",
        severity: "success",
      });
      setOpenDialog(false);
      setFormData({ name: "", description: "", categoryId: "" });
      void refetch();
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    },
  });

  const [updateRisk] = useMutation(UPDATE_RISK, {
    onCompleted: () => {
      setSnackbar({
        open: true,
        message: "Risk updated successfully",
        severity: "success",
      });
      void refetch();
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    },
  });

  const [deleteRisk] = useMutation(DELETE_RISK, {
    onCompleted: () => {
      setSnackbar({
        open: true,
        message: "Risk deleted successfully",
        severity: "success",
      });
      void refetch();
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    },
  });

  const handleCreateRisk = (): void => {
    void createRisk({
      variables: {
        input: {
          name: formData.name,
          description: formData.description,
          categoryId: formData.categoryId,
          status: "UNRESOLVED",
        },
      },
    });
  };

  const handleUpdateRisk = (
    id: string,
    input: {
      name?: string;
      description?: string;
      categoryId?: string;
      status?: RiskStatus;
    },
  ): void => {
    void updateRisk({
      variables: { id, input },
      optimisticResponse: {
        updateRisk: {
          __typename: "Risk",
          id,
          name: input.name ?? "",
          description: input.description ?? "",
          status: input.status ?? "UNRESOLVED",
          createdBy: "",
          createdAt: "",
          category: {
            __typename: "Category",
            id: input.categoryId ?? "",
            name: "",
          },
        },
      },
    });
  };

  const handleDeleteRisk = (id: string): void => {
    void deleteRisk({
      variables: { id },
    });
    setDeleteConfirm({ open: false, id: "", name: "" });
  };

  const handleStatusClick = (risk: Risk): void => {
    const newStatus: RiskStatus =
      risk.status === "RESOLVED" ? "UNRESOLVED" : "RESOLVED";
    setStatusConfirm({ open: true, risk, newStatus });
  };

  const handleConfirmStatusChange = (): void => {
    if (statusConfirm.risk && statusConfirm.newStatus) {
      handleUpdateRisk(statusConfirm.risk.id, {
        status: statusConfirm.newStatus,
      });
    }
    setStatusConfirm({ open: false, risk: null, newStatus: null });
  };

  const handleSearch = (): void => {
    setSearch(searchInput);
    setPage(0);
  };

  const risks = data?.risks.edges ?? [];
  const pageInfo = data?.risks.pageInfo;
  const categories = categoriesData?.categories.edges ?? [];

  return (
    <Box sx={{ width: "100%" }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          gap: 2,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <TextField
          size="small"
          placeholder="Search risks..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          sx={{ minWidth: 250 }}
        />
        <Button variant="outlined" onClick={handleSearch}>
          Search
        </Button>
        {search && (
          <Button
            variant="outlined"
            onClick={() => {
              setSearch("");
              setSearchInput("");
            }}
          >
            Clear
          </Button>
        )}
        <FormControlLabel
          control={
            <Switch
              checked={!showResolved}
              onChange={(e) => setShowResolved(!e.target.checked)}
            />
          }
          label="Hide Resolved"
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ ml: "auto" }}
        >
          Add Risk
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : risks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary">No risks found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              risks.map((risk: Risk) => (
                <TableRow key={risk.id} hover>
                  <TableCell>
                    <InlineEdit
                      value={risk.name}
                      onSave={(value) =>
                        handleUpdateRisk(risk.id, { name: value })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <InlineEdit
                      value={risk.description}
                      onSave={(value) =>
                        handleUpdateRisk(risk.id, { description: value })
                      }
                      multiline
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={risk.category.id}
                      onChange={(e) =>
                        handleUpdateRisk(risk.id, {
                          categoryId: e.target.value,
                        })
                      }
                      size="small"
                      variant="standard"
                      sx={{ minWidth: 120 }}
                    >
                      {categories.map((cat: Category) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={risk.status}
                      color={risk.status === "RESOLVED" ? "success" : "warning"}
                      onClick={() => handleStatusClick(risk)}
                      sx={{ cursor: "pointer" }}
                    />
                  </TableCell>
                  <TableCell>{risk.createdBy}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="error"
                      onClick={() =>
                        setDeleteConfirm({
                          open: true,
                          id: risk.id,
                          name: risk.name,
                        })
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {pageInfo && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
            component="div"
            count={pageInfo.totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        )}
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Risk</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              label="Category"
            >
              {categories.map((cat: Category) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateRisk}
            variant="contained"
            disabled={
              !formData.name || !formData.description || !formData.categoryId
            }
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Delete Risk"
        message={`Are you sure you want to delete "${deleteConfirm.name}"?`}
        onConfirm={() => handleDeleteRisk(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ open: false, id: "", name: "" })}
      />

      <ConfirmDialog
        open={statusConfirm.open}
        title="Change Risk Status"
        message={
          statusConfirm.risk && statusConfirm.newStatus
            ? `Are you sure you want to mark "${statusConfirm.risk.name}" as ${statusConfirm.newStatus}?`
            : ""
        }
        onConfirm={handleConfirmStatusChange}
        onCancel={() =>
          setStatusConfirm({ open: false, risk: null, newStatus: null })
        }
        confirmText="Approve"
        confirmColor="primary"
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
