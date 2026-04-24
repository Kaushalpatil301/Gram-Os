import axios from 'axios';

async function testOrder() {
  try {
    const res = await axios.post("http://localhost:8000/api/v1/marketplace/create-order", { amount: 12050 });
    console.log("Success:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

testOrder();
