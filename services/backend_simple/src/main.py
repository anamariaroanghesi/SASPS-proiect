from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import psycopg2
import os

app = Flask(__name__)
CORS(app)

def get_db_connection():
    """Helper function to get database connection"""
    return psycopg2.connect(
        host="db",
        database=os.environ["POSTGRES_DB"],
        user=os.environ["POSTGRES_USER"],
        password=os.environ["POSTGRES_PASSWORD"]
    )

# ==================== MOVIES ====================

@app.route("/movies", methods=["GET"])
def get_movies():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, title, year FROM movies;")
    result = cur.fetchall()
    cur.close()
    conn.close()
    
    output = [{"id": int(row[0]), "title": row[1], "year": int(row[2])} for row in result]
    return jsonify(output), 200

@app.route("/movies/<int:movie_id>", methods=["GET"])
def get_movie_by_id(movie_id):
    level = request.args.get('level', 'complex')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    if level == 'basic':
        cur.execute("SELECT id, title, year FROM movies WHERE id = %s;", (movie_id,))
        result = cur.fetchone()
        cur.close()
        conn.close()
        
        if not result:
            return Response(status=404)
        
        output = {"id": int(result[0]), "title": result[1], "year": int(result[2])}
    else:
        cur.execute("""
            SELECT movies.id, movies.title, movies.year, directors.name, genres.name, movie_details.synopsis 
            FROM movies 
            INNER JOIN movie_details ON movies.id = movie_details.id
            INNER JOIN directors ON movie_details.director_id = directors.id
            INNER JOIN genres ON movie_details.genre_id = genres.id
            WHERE movies.id = %s;
        """, (movie_id,))
        result = cur.fetchone()
        cur.close()
        conn.close()
        
        if not result:
            return Response(status=404)
        
        output = {
            "id": int(result[0]),
            "title": result[1],
            "year": int(result[2]),
            "director": result[3].strip() if result[3] else None,
            "genre": result[4].strip() if result[4] else None,
            "synopsis": result[5].strip() if result[5] else None
        }
    
    return jsonify(output), 200

# ==================== WATCHLIST ====================

@app.route("/users/<int:user_id>/watchlist", methods=["GET"])
def get_user_watchlist(user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT m.id, m.title, m.year 
        FROM movies m 
        JOIN watchlist w ON m.id = w.movie_id 
        WHERE w.user_id = %s
        ORDER BY w.added_at DESC;
    """, (user_id,))
    result = cur.fetchall()
    cur.close()
    conn.close()
    
    output = [{"id": int(row[0]), "title": row[1], "year": int(row[2])} for row in result]
    return jsonify(output), 200

@app.route("/users/<int:user_id>/watchlist", methods=["POST"])
def post_user_watchlist(user_id):
    data = request.get_json()
    movie_id = data.get("movie_id")
    
    if not movie_id:
        return jsonify({"error": "movie_id is required"}), 400
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(
            "INSERT INTO watchlist (user_id, movie_id) VALUES (%s, %s);",
            (user_id, movie_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Added to watchlist"}), 201
    except psycopg2.IntegrityError:
        conn.rollback()
        cur.close()
        conn.close()
        return jsonify({"message": "Already in watchlist"}), 200

@app.route("/users/<int:user_id>/watchlist/<int:movie_id>", methods=["DELETE"])
def delete_movie_from_watchlist(user_id, movie_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "DELETE FROM watchlist WHERE user_id = %s AND movie_id = %s;",
        (user_id, movie_id)
    )
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Removed from watchlist"}), 200

# ==================== VIEWED ====================

@app.route("/users/<int:user_id>/viewed", methods=["GET"])
def get_user_viewed(user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT m.id, m.title, m.year, v.rating 
        FROM movies m 
        JOIN viewed v ON m.id = v.movie_id 
        WHERE v.user_id = %s
        ORDER BY v.viewed_at DESC;
    """, (user_id,))
    result = cur.fetchall()
    cur.close()
    conn.close()
    
    output = [
        {"id": int(row[0]), "title": row[1], "year": int(row[2]), "rating": row[3]} 
        for row in result
    ]
    return jsonify(output), 200

@app.route("/users/<int:user_id>/viewed", methods=["POST"])
def post_user_viewed(user_id):
    data = request.get_json()
    movie_id = data.get("movie_id")
    rating = data.get("rating")
    
    if not movie_id:
        return jsonify({"error": "movie_id is required"}), 400
    if not rating or rating < 1 or rating > 5:
        return jsonify({"error": "rating must be between 1 and 5"}), 400
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        # Try to insert
        cur.execute(
            "INSERT INTO viewed (user_id, movie_id, rating) VALUES (%s, %s, %s);",
            (user_id, movie_id, rating)
        )
        conn.commit()
        
        # Also remove from watchlist if present
        cur.execute(
            "DELETE FROM watchlist WHERE user_id = %s AND movie_id = %s;",
            (user_id, movie_id)
        )
        conn.commit()
        
        cur.close()
        conn.close()
        return jsonify({"message": "Marked as viewed"}), 201
    except psycopg2.IntegrityError:
        conn.rollback()
        # Already exists, update the rating
        cur.execute(
            "UPDATE viewed SET rating = %s, viewed_at = CURRENT_TIMESTAMP WHERE user_id = %s AND movie_id = %s;",
            (rating, user_id, movie_id)
        )
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "Rating updated"}), 200

@app.route("/users/<int:user_id>/viewed/<int:movie_id>", methods=["DELETE"])
def delete_movie_from_viewed(user_id, movie_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "DELETE FROM viewed WHERE user_id = %s AND movie_id = %s;",
        (user_id, movie_id)
    )
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Removed from viewed"}), 200

if __name__ == '__main__':
    app.run('0.0.0.0', debug=True)
