import conn from "../config/db.js"


// get all
export const getAll = async () => {
    const result = await conn.query(`
        SELECT c.*, (SELECT COUNT(*) FROM posts WHERE category_id = c.id) AS count
        FROM categories c
        ORDER BY c.id DESC
    `);
    return result.rows;
}

// get one
export const getById = async (id) => {
    const result = await conn.query("select * from categories where id=$1", [id]);
    return result.rows[0]
}

// create
export const create = async ({ name, slug, description }) => {
    const result = await conn.query("insert into categories  (name, slug, description) values ($1,$2,$3) returning *", [name, slug, description]);
    return result.rows[0];
}

// update 
export const update = async (id, { name, slug, description }) => {
    const result = await conn.query("update categories set name=$1 , slug=$2 , description=$3 where id=$4 returning *", [name, slug, description, id]);
    return result.rows[0];
}

// delete
export const remove = async (id) => {
    const result = await conn.query(
        "DELETE FROM categories WHERE id = $1 RETURNING *",
        [id]
    );

    return result.rows[0];
}