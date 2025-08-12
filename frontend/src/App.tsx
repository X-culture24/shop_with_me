import React, { useEffect, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";
import { Container, Typography, Button, Card, CardContent } from "@mui/material";
import axios from "axios";

interface Product {
  id: number;
  name: string;
  price: number;
  color: string;
  status: string;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    axios.get("/api/products").then((res) => setProducts(res.data));
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Typography variant="h4" gutterBottom>
          Today's Deals
        </Typography>
        {products.map((p) => (
          <Card key={p.id} sx={{ marginBottom: 2 }}>
            <CardContent>
              <Typography variant="h6">{p.name}</Typography>
              <Typography>Price: KES {p.price}</Typography>
              <Typography>Color: {p.color}</Typography>
              <Typography>Status: {p.status}</Typography>
              <Button variant="contained" color="secondary">
                Buy Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </Container>
    </ThemeProvider>
  );
}

export default App;

