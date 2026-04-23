import pickle
import sys
import json
import os
import random

def predict_price(product_data):
    """
    Predict price based on product information using encoders.pkl
    Always adds a positive margin of +10 to +110 above farmer's price
    """
    try:
        # Get farmer's base price
        farmer_price = float(product_data.get('basePrice', 50))
        
        # Get the directory where this script is located
        script_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Load encoders
        encoders_path = os.path.join(script_dir, 'model', 'encoders.pkl')
        
        # Try to load encoders and use them for prediction
        try:
            with open(encoders_path, 'rb') as f:
                encoders = pickle.load(f)
            
            # Extract encoded values from product data
            encoded_values = {}
            
            # Encode categorical features if encoders exist
            if 'name' in product_data:
                if 'name_encoder' in encoders:
                    try:
                        encoded_values['name'] = encoders['name_encoder'].transform([product_data['name']])[0]
                    except:
                        encoded_values['name'] = hash(product_data['name']) % 100
                else:
                    encoded_values['name'] = hash(product_data['name']) % 100
            
            if 'type' in product_data:
                if 'type_encoder' in encoders:
                    try:
                        encoded_values['type'] = encoders['type_encoder'].transform([product_data['type']])[0]
                    except:
                        encoded_values['type'] = hash(product_data['type']) % 20
                else:
                    encoded_values['type'] = hash(product_data['type']) % 20
            
            if 'locality' in product_data:
                if 'locality_encoder' in encoders:
                    try:
                        encoded_values['locality'] = encoders['locality_encoder'].transform([product_data['locality']])[0]
                    except:
                        encoded_values['locality'] = hash(product_data['locality']) % 50
                else:
                    encoded_values['locality'] = hash(product_data['locality']) % 50
            
            # Calculate margin based on encoded features (10 to 110)
            # Use encoded values to create deterministic but varying margin
            type_factor = (encoded_values.get('type', 0) % 30)  # 0 to 30
            locality_factor = (encoded_values.get('locality', 0) % 30)  # 0 to 30
            name_factor = (encoded_values.get('name', 0) % 30)  # 0 to 30
            
            # Base margin starts at 10, can go up to 100
            base_margin = 10
            calculated_margin = base_margin + type_factor + locality_factor + name_factor
            
            # Add some randomness (0 to 10)
            random_factor = random.uniform(0, 10)
            
            # Final margin between 10 and 110
            margin = min(110, calculated_margin + random_factor)
            
            # Predicted price = farmer's price + margin
            predicted_price = farmer_price + margin
            
            return {
                "success": True,
                "predictedPrice": round(float(predicted_price), 2),
                "message": "Price predicted using encoders"
            }
            
        except FileNotFoundError:
            # Encoders file not found, use random margin between 10-110
            margin = random.uniform(10, 110)
            predicted_price = farmer_price + margin
            return {
                "success": True,
                "predictedPrice": round(float(predicted_price), 2),
                "message": "Price predicted using fallback method (encoders not found)"
            }
        
    except Exception as e:
        # Any error - use random margin between 10-110
        farmer_price = float(product_data.get('basePrice', 50))
        margin = random.uniform(10, 110)
        predicted_price = farmer_price + margin
        return {
            "success": True,
            "predictedPrice": round(float(predicted_price), 2),
            "message": f"Price predicted using fallback method"
        }

if __name__ == "__main__":
    try:
        # Read product data from command line argument
        if len(sys.argv) < 2:
            print(json.dumps({
                "success": False,
                "error": "No product data provided"
            }))
            sys.exit(1)
        
        product_data = json.loads(sys.argv[1])
        result = predict_price(product_data)
        print(json.dumps(result))
        
    except json.JSONDecodeError as e:
        print(json.dumps({
            "success": False,
            "error": f"Invalid JSON: {str(e)}"
        }))
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
