from pymongo import MongoClient
from dotenv import load_dotenv
import os


load_dotenv()


client = MongoClient(os.getenv('MONGODB_URI'))
db = client['backseat']
collection = db['embeddings']

issu = collection.find_one({"repoId": 683423326, "githubId": 7})
results = collection.aggregate([
      {
          '$search': {
              "index": 'embeddings',
              "scoreDetails": True,
              "knnBeta": {
                  "vector": issu['cohereSmallEmbedding'],
                  #"filter": {"githubId": {"$ne": 7}},
                  "k": 10,
                  "path": 'cohereSmallEmbedding'}
          },
          
      },
      {
  "$project": {
    "scoreDetails": {"$meta": "searchScoreDetails"},
    "text":1,
    "type":1,
    "githubId":1
  }
}
  ])
for doc in results:
    docCopy = doc.copy()
    docCopy.pop("cohereSmallEmbedding", None)
    pprint(docCopy)