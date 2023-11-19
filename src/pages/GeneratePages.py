import os

pages = ["Suppliers", "Market", "Farms", "Drivers", "Reconcile", "FAQs"]

for page in pages:
    file_content = f'''
import React from "react";
import Layout from "../components/Layout";
import {{
  Avatar,
  Box,
  Button,
  ButtonBase,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
}} from "@mui/material";

const {page} = () => {{
  return (
    <Layout>
      
    </Layout>
  );
}}

export default {page};
'''
    # Create a directory if it doesn't exist
    if not os.path.exists(page):
        os.makedirs(page)

    # Write the content to a JSX file
    with open(f"{page}.jsx", "w") as file:
        file.write(file_content)

print("Pages created successfully.")
