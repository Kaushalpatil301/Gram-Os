export const produceTypes = [
  "Vegetable",
  "Fruit",
  "Grain",
  "Leafy Greens",
  "Pulse",
  "Spice",
  "Dairy",
  "Other",
]

export function emptyProduce() {
  return {
    name: "",
    type: "",
    quantity: 0,
    basePrice: 0,
    locality: "",
  }
}

export const initialProduce = [
  {
    id: "p1",
    name: "Tomatoes",
    type: "Vegetable",
    quantity: 120,
    basePrice: 24.5,
    certificate: "https://gateway/cert/Qm123",
    locality: "Nashik",
  },
  {
    id: "p2",
    name: "Onions",
    type: "Vegetable",
    quantity: 200,
    basePrice: 18.0,
    locality: "Nashik",
  },
  {
    id: "p3",
    name: "Wheat",
    type: "Grain",
    quantity: 500,
    basePrice: 22.0,
    certificate: "https://gateway/cert/Qm456",
    locality: "Pune",
  },
]