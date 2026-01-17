from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import psycopg2
import os
from api import API

app = Flask(__name__)
CORS(app)
api = API()

# ==================== MOVIES ====================

@app.route("/movies", methods=["GET"])
def get_movies():
    return api.get_movie_list()

@app.route("/movies/<int:movie_id>", methods=["GET"])
def get_movie_by_id(movie_id):
    level = request.args.get('level', 'complex')
    
    if level == 'basic':
        return api.get_movie_simple(movie_id)
    else:
        return api.get_movie_complex(movie_id)

# ==================== WATCHLIST ====================

@app.route("/users/<int:user_id>/watchlist", methods=["GET"])
def get_user_watchlist(user_id):
    return api.get_watchlist(user_id)

@app.route("/users/<int:user_id>/watchlist", methods=["POST"])
def post_user_watchlist(user_id):
    data = request.get_json()
    movie_id = data.get("movie_id")
    
    if not movie_id:
        return jsonify({"error": "movie_id is required"}), 400
    
    return api.add_to_watchlist(user_id, movie_id)

@app.route("/users/<int:user_id>/watchlist/<int:movie_id>", methods=["DELETE"])
def delete_movie_from_watchlist(user_id, movie_id):
    return api.delete_from_list(user_id, movie_id, "watchlist")

# ==================== VIEWED ====================

@app.route("/users/<int:user_id>/viewed", methods=["GET"])
def get_user_viewed(user_id):
    return api.get_viewlist(user_id)

@app.route("/users/<int:user_id>/viewed", methods=["POST"])
def post_user_viewed(user_id):
    data = request.get_json()
    movie_id = data.get("movie_id")
    rating = data.get("rating")
    
    if not movie_id:
        return jsonify({"error": "movie_id is required"}), 400
    if not rating or rating < 1 or rating > 5:
        return jsonify({"error": "rating must be between 1 and 5"}), 400
    
    return api.add_to_viewlist(user_id, movie_id, rating)

@app.route("/users/<int:user_id>/viewed/<int:movie_id>", methods=["DELETE"])
def delete_movie_from_viewed(user_id, movie_id):
    return api.delete_from_list(user_id, movie_id, "viewed")

if __name__ == '__main__':
    app.run('0.0.0.0', debug=True)
