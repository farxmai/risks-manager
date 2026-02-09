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
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  TablePagination,
  CircularProgress,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {
  GET_CATEGORIES,
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
} from "../graphql/queries";
import { ConfirmDialog } from "./ConfirmDialog";
import { InlineEdit } from "./InlineEdit";

interface Category {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

export function CategoriesTable(): JSX.Element {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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
  });

  const { data, loading, error, refetch } = useQuery(GET_CATEGORIES, {
    variables: {
      page: page + 1,
      limit: rowsPerPage,
      search: search || undefined,
    },
  });

  const [createCategory] = useMutation(CREATE_CATEGORY, {
    onCompleted: () => {
      setSnackbar({
        open: true,
        message: "Category created successfully",
        severity: "success",
      });
      setOpenDialog(false);
      setFormData({ name: "", description: "" });
      void refetch();
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    },
  });

  const [updateCategory] = useMutation(UPDATE_CATEGORY, {
    onCompleted: () => {
      setSnackbar({
        open: true,
        message: "Category updated successfully",
        severity: "success",
      });
      void refetch();
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    },
  });

  const [deleteCategory] = useMutation(DELETE_CATEGORY, {
    onCompleted: () => {
      setSnackbar({
        open: true,
        message: "Category deleted successfully",
        severity: "success",
      });
      void refetch();
    },
    onError: (error) => {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    },
  });

  const handleCreateCategory = (): void => {
    void createCategory({
      variables: {
        input: {
          name: formData.name,
          description: formData.description,
        },
      },
    });
  };

  const handleUpdateCategory = (
    id: string,
    input: { name?: string; description?: string },
  ): void => {
    void updateCategory({
      variables: { id, input },
      optimisticResponse: {
        updateCategory: {
          __typename: "Category",
          id,
          name: input.name ?? "",
          description: input.description ?? "",
          createdBy: "",
          createdAt: "",
        },
      },
    });
  };

  const handleDeleteCategory = (id: string): void => {
    void deleteCategory({
      variables: { id },
    });
    setDeleteConfirm({ open: false, id: "", name: "" });
  };

  const handleSearch = (): void => {
    setSearch(searchInput);
    setPage(0);
  };

  const categories = data?.categories.edges ?? [];
  const pageInfo = data?.categories.pageInfo;

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
          placeholder="Search categories..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ ml: "auto" }}
        >
          Add Category
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
              <TableCell>Created By</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="text.secondary">
                    No categories found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category: Category) => (
                <TableRow key={category.id} hover>
                  <TableCell>
                    <InlineEdit
                      value={category.name}
                      onSave={(value) =>
                        handleUpdateCategory(category.id, { name: value })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <InlineEdit
                      value={category.description}
                      onSave={(value) =>
                        handleUpdateCategory(category.id, {
                          description: value,
                        })
                      }
                      multiline
                    />
                  </TableCell>
                  <TableCell>{category.createdBy}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="error"
                      onClick={() =>
                        setDeleteConfirm({
                          open: true,
                          id: category.id,
                          name: category.name,
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
        <DialogTitle>Add New Category</DialogTitle>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateCategory}
            variant="contained"
            disabled={!formData.name || !formData.description}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This will fail if there are risks using this category.`}
        onConfirm={() => handleDeleteCategory(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm({ open: false, id: "", name: "" })}
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
