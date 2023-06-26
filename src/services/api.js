import { CubejsApi } from "@cubejs-client/core";

const apiUrl =
  "https://heavy-lansford.gcp-us-central1.cubecloudapp.dev/cubejs-api/v1";
const cubeToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjEwMDAwMDAwMDAsImV4cCI6NTAwMDAwMDAwMH0.OHZOpOBVKr-sCwn8sbZ5UFsqI3uCs6e4omT7P6WVMFw";

const cubeApi = new CubejsApi(cubeToken, { apiUrl });

export async function getAquisitionsByYear() {
  const acquisitionsByYearQuery = {
    dimensions: ["Artworks.yearAcquired"],
    measures: ["Artworks.count"],
    filters: [
      {
        member: "Artworks.yearAcquired",
        operator: "set",
      },
    ],
    order: {
      "Artworks.yearAcquired": "asc",
    },
  };

  const resultSet = await cubeApi.load(acquisitionsByYearQuery);

  return resultSet.tablePivot().map((row) => ({
    year: parseInt(row["Artworks.yearAcquired"]),
    count: parseInt(row["Artworks.count"]),
  }));
}

export async function getDimensions() {
  const dimensionsQuery = {
    dimensions: ["Artworks.widthCm", "Artworks.heightCm"],
    measures: ["Artworks.count"],
    filters: [
      {
        member: "Artworks.classification",
        operator: "equals",
        values: ["Painting"],
      },
      {
        member: "Artworks.widthCm",
        operator: "set",
      },
      {
        member: "Artworks.widthCm",
        operator: "lt",
        values: ["500"],
      },
      {
        member: "Artworks.heightCm",
        operator: "set",
      },
      {
        member: "Artworks.heightCm",
        operator: "lt",
        values: ["500"],
      },
    ],
  };

  const resultSet = await cubeApi.load(dimensionsQuery);

  return resultSet.tablePivot().map((row) => ({
    width: parseInt(row["Artworks.widthCm"]),
    height: parseInt(row["Artworks.heightCm"]),
    count: parseInt(row["Artworks.count"]),
  }));
}
export const salesOvertimeColumns = [
  {
    title: "Country",
    dataIndex: "country",
    filters: [
      {
        text: "Joe",
        value: "Joe",
      },
      {
        text: "Jim",
        value: "Jim",
      },
      {
        text: "Submenu",
        value: "Submenu",
        children: [
          {
            text: "Green",
            value: "Green",
          },
          {
            text: "Black",
            value: "Black",
          },
        ],
      },
    ],
    // specify the condition of filtering result
    // here is that finding the name started with `value`
    onFilter: (value, record) => record.location.indexOf(value) === 0,
    sorter: (a, b) => a.location.length - b.location.length,
    sortDirections: ["descend"],
  },
  {
    title: "Sales",
    dataIndex: "numberOfSales",
    defaultSortOrder: "descend",
    sorter: (a, b) => a.numberOfSales - b.numberOfSales,
  },
  {
    title: "Amount",
    dataIndex: "amount",
    filters: [
      {
        text: "London",
        value: "London",
      },
      {
        text: "New York",
        value: "New York",
      },
    ],
    onFilter: (value, record) => record.amount.indexOf(value) === 0,
  },
];
export const salesOvertimeData = [
  {
    key: "1",
    location: "Johannesburg",
    amount: "R15,000.00",
    countryCode: "ZA",
    country: "South Africa",
    flagImage: "https://example.com/southafrica-flag.png",
    numberOfSales: 25,
  },
  {
    key: "1",
    location: "Cape Town",
    amount: "R12,000.00",
    countryCode: "ZA",
    country: "South Africa",
    flagImage: "https://example.com/southafrica-flag.png",
    numberOfSales: 18,
  },
  {
    key: "1",
    location: "Lusaka",
    amount: "R9,000.00",
    countryCode: "ZM",
    country: "Zambia",
    flagImage: "https://example.com/zambia-flag.png",
    numberOfSales: 14,
  },
];
export const liveSalesColumns = [
  {
    title: "Country",
    dataIndex: "country",
    filters: [
      {
        text: "Joe",
        value: "Joe",
      },
      {
        text: "Jim",
        value: "Jim",
      },
      {
        text: "Submenu",
        value: "Submenu",
        children: [
          {
            text: "Green",
            value: "Green",
          },
          {
            text: "Black",
            value: "Black",
          },
        ],
      },
    ],
    // specify the condition of filtering result
    // here is that finding the name started with `value`
    onFilter: (value, record) => record.location.indexOf(value) === 0,
    sorter: (a, b) => a.location.length - b.location.length,
    sortDirections: ["descend"],
  },
  {
    title: "Sales",
    dataIndex: "numberOfSales",
    defaultSortOrder: "descend",
    sorter: (a, b) => a.numberOfSales - b.numberOfSales,
  },
  {
    title: "Amount",
    dataIndex: "amount",
    filters: [
      {
        text: "London",
        value: "London",
      },
      {
        text: "New York",
        value: "New York",
      },
    ],
    onFilter: (value, record) => record.amount.indexOf(value) === 0,
  },
];
export const liveSalesData = [
  {
    key: "1",
    productName: "Mixed Fruits",
    country: "South Africa",
    saleTime: "5min",
  },
  {
    key: "1",
    location: "Cape Town",
    amount: "R12,000.00",
    countryCode: "ZA",
    country: "South Africa",
    flagImage: "https://example.com/southafrica-flag.png",
    numberOfSales: 18,
  },
  {
    key: "1",
    location: "Lusaka",
    amount: "R9,000.00",
    countryCode: "ZM",
    country: "Zambia",
    flagImage: "https://example.com/zambia-flag.png",
    numberOfSales: 14,
  },
];
