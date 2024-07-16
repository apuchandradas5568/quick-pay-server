import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const url = process.env.DATABASE_URL

const client = new MongoClient(url)


export default async function mongoConnect() {
    try {
        await client.connect()
        console.log("Connected to the database")
    } catch (error) {
        console.error("Error connecting to the database: ", error)
    }
    finally{
        // await client.close();
    }

}


export const db = client.db("as-12")

export const usersCollection = db.collection("users")
export const biodatasCollection = db.collection("biodatas")
export const paymentsCollection = db.collection("payments")
export const contactsCollection = db.collection("contacts")
export const reviewsCollection = db.collection("reviews")
export const favouritesCollection = db.collection("favourites")
