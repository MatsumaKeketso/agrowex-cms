import { Box, IconButton, Stack, Typography } from "@mui/material";
import React from "react";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import PointOfSaleRoundedIcon from "@mui/icons-material/PointOfSaleRounded";
function StatsCard() {
  return (
    <Stack
      spacing={2}
      bgcolor={"#F6F6F6"}
      p={2}
      sx={{ maxWidth: 400, minWidth: 250, borderRadius: 2 }}
    >
      <Stack direction={"row"} alignItems={"center"} spacing={1}>
        <Stack flex={1}>
          <IconButton sx={{ alignSelf: "flex-start" }}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.5 13.7483C9.5 14.7183 10.25 15.4983 11.17 15.4983H13.05C13.85 15.4983 14.5 14.8183 14.5 13.9683C14.5 13.0583 14.1 12.7283 13.51 12.5183L10.5 11.4683C9.91 11.2583 9.51001 10.9383 9.51001 10.0183C9.51001 9.17828 10.16 8.48828 10.96 8.48828H12.84C13.76 8.48828 14.51 9.26828 14.51 10.2383"
                stroke="#292D32"
                strokeWidth="1.5"
                stroklinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 7.5V16.5"
                stroke="#292D32"
                strokeWidth="1.5"
                stroklinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2"
                stroke="#292D32"
                strokeWidth="1.5"
                stroklinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17 3V7H21"
                stroke="#292D32"
                strokeWidth="1.5"
                stroklinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 2L17 7"
                stroke="#292D32"
                strokeWidth="1.5"
                stroklinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </IconButton>
        </Stack>
        <Stack
          direction={"row"}
          alignItems={"center"}
          sx={{ color: "blue" }}
          spacing={1}
        >
          <TrendingUpRoundedIcon />
          <Typography variant="caption">15.5%</Typography>
        </Stack>

        <Typography variant="overline">R20k this month</Typography>
      </Stack>
      <Stack>
        <Typography variant="h4">R12,345.67</Typography>
        <Typography color={"GrayText"} variant="subtitle1">
          Total Sales
        </Typography>
      </Stack>
    </Stack>
  );
}

export default StatsCard;
