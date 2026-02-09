import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Tabs,
  Tab,
} from "@mui/material";
import { useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./components/LoginPage";
import { RisksTable } from "./components/RisksTable";
import { CategoriesTable } from "./components/CategoriesTable";

function App(): JSX.Element {
  const { user, logout } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Risk Manager
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            Welcome, {user}
          </Typography>
          <Button color="inherit" onClick={logout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
          >
            <Tab label="Risks" />
            <Tab label="Categories" />
          </Tabs>
        </Box>

        {currentTab === 0 && <RisksTable />}
        {currentTab === 1 && <CategoriesTable />}
      </Container>
    </Box>
  );
}

export default App;
