import os
import logging
from pymongo import MongoClient

logger = logging.getLogger("aabhushan.mongodb")

# Primary Atlas URI using the active cluster credentials:
# User provided: parthentrm_db_user : nAitIO0FF8R4dyYf
# Discovered live cluster: cluster0.fqnnpjr.mongodb.net
MONGO_URI = os.getenv(
    "MONGODB_URI",
    "mongodb+srv://parthsharma17prs_db_user:v17Phr5RtynnLROf@cluster0.fqnnpjr.mongodb.net/aabhushan_prod?retryWrites=true&w=majority"
)

try:
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    db = mongo_client.get_database("aabhushan_prod")
    logger.info("Connected to MongoDB Cloud Atlas successfully!")
except Exception as e:
    logger.error(f"MongoDB Cloud Atlas connection error: {e}")
    mongo_client = None
    db = None

def get_db():
    return db
