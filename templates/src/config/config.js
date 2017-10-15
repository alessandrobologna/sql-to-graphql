export default {
    client: 'mysql',

    connection: {
        'host': process.env.DB_HOST,
        'user': process.env.DB_USER,
        'password': process.env.DB_PASSWORD,
        'database': process.env.DB,
        'debug' : 0 
    },
    pool: { min: 16, max: 32 }
};