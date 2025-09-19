import { sql } from '../config/db.js';

export const getProducts = async (req, res) => {
    try{
        // Fetch all products from the database
        const products = await sql`
        SELECT * FROM products 
        ORDER BY created_at DESC
        `;

        console.log("Fetched products:", products);
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};




export const createProduct = async (req,res) => {
    const {name, image, price} = req.body;
    try {
        if(!name || !image || !price){
            return res.status(400).json({success:false, message:'All fields are required'});
        }

        const newProduct = await sql`
            INSERT INTO products (name, image, price) 
            VALUES (${name}, ${image}, ${price})
            RETURNING *
        `;
        res.status(201).json({success:true, message:'Product created successfully', data:newProduct[0]});
    } catch (error) {
        console.error('Error in createProduct function', error);
        res.status(500).json({success:false, message:'Internal Server Error'});
    }
};

export const getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const products = await sql`
            SELECT * FROM products WHERE id = ${id}
        `;
        if (products.length > 0) {
            res.status(200).json(products[0]);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updateProduct = async (req, res) => {

    try {
        const { id } = req.params;
        const { name, image, price } = req.body;

        // Check if the product exists
        const existingProduct = await sql`
            SELECT * FROM products WHERE id = ${id}
        `;

        if (existingProduct.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Update the product
        const updatedProduct = await sql`
            UPDATE products
            SET name = ${name}, image = ${image}, price = ${price}
            WHERE id = ${id}
            RETURNING *
        `;

        res.status(200).json({ success: true, message: 'Product updated successfully', data: updatedProduct[0] });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }

};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the product exists
        const existingProduct = await sql`
            SELECT * FROM products WHERE id = ${id}
        `;

        if (existingProduct.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Delete the product
        const deletedProduct = await sql`
            DELETE FROM products WHERE id = ${id}
            RETURNING *
        `;

        res.status(200).json({ success: true, message: 'Product deleted successfully', data: deletedProduct[0] });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }

};

