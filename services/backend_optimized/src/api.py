from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import psycopg2
import os
import json

def get_db_connection():
    """Helper function to get database connection"""
    return psycopg2.connect(
        host="db",
        database=os.environ["POSTGRES_DB"],
        user=os.environ["POSTGRES_USER"],
        password=os.environ["POSTGRES_PASSWORD"]
    )



class API:

    _bytesRead: int = 0
    
    def get_movie_list(self):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, title, year, poster_url FROM movies;")
        result = cur.fetchall()
        cur.close()
        conn.close()
        
        output = [{"id": int(row[0]), "title": row[1], "year": int(row[2]), "poster_url": row[3]} for row in result]
        self._bytesRead += len(json.dumps(output))
        return jsonify(output), 200
    
    def get_movie_simple(self, id):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, title, year, poster_url FROM movies WHERE id = %s;", (id,))
        result = cur.fetchone()
        cur.close()
        
        if not result:
            return Response(status=404)
        
        output = {"id": int(result[0]), "title": result[1], "year": int(result[2]), "poster_url": result[3]}
        self._bytesRead += len(json.dumps(output))
        return jsonify(output), 200
    
    def get_movie_complex(self, id):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT movies.id, movies.title, movies.year, movies.poster_url, directors.name, genres.name, movie_details.synopsis 
            FROM movies 
            INNER JOIN movie_details ON movies.id = movie_details.id
            INNER JOIN directors ON movie_details.director_id = directors.id
            INNER JOIN genres ON movie_details.genre_id = genres.id
            WHERE movies.id = %s;
        """, (id,))
        result = cur.fetchone()
        cur.close()
        
        if not result:
            return Response(status=404)
        
        output = {
            "id": int(result[0]),
            "title": result[1],
            "year": int(result[2]),
            "poster_url": result[3],
            "director": result[4].strip() if result[4] else None,
            "genre": result[5].strip() if result[5] else None,
            "synopsis": result[6].strip() if result[6] else None
        }
        self._bytesRead += len(json.dumps(output))
        return jsonify(output), 200
    
    def get_watchlist(self, user_id):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT m.id, m.title, m.year, m.poster_url 
            FROM movies m 
            JOIN watchlist w ON m.id = w.movie_id 
            WHERE w.user_id = %s
            ORDER BY w.added_at DESC;
        """, (user_id,))
        result = cur.fetchall()
        cur.close()
        
        output = [{"id": int(row[0]), "title": row[1], "year": int(row[2]), "poster_url": row[3]} for row in result]
        self._bytesRead += len(json.dumps(output))
        return jsonify(output), 200
    
    def delete_from_list(self, user_id, movie_id, operation):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "DELETE FROM %s WHERE user_id = %s AND movie_id = %s;",
            (operation, user_id, movie_id)
        )
        conn.commit()
        cur.close()
        return jsonify({"message": "Removed from " + operation}), 200
    
    def add_to_watchlist(self, user_id, movie_id):
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            cur.execute(
                "INSERT INTO watchlist (user_id, movie_id) VALUES (%s, %s);",
                (user_id, movie_id)
            )
            conn.commit()
            cur.close()
            return jsonify({"message": "Added to watchlist"}), 201
        except psycopg2.IntegrityError:
            conn.rollback()
            cur.close()
            return jsonify({"message": "Already in watchlist"}), 200
        
    def get_viewlist(self, user_id):
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("""
            SELECT m.id, m.title, m.year, m.poster_url, v.rating 
            FROM movies m 
            JOIN viewed v ON m.id = v.movie_id 
            WHERE v.user_id = %s
            ORDER BY v.viewed_at DESC;
        """, (user_id,))
        result = cur.fetchall()
        cur.close()
        
        output = [
            {"id": int(row[0]), "title": row[1], "year": int(row[2]), "poster_url": row[3], "rating": row[4]} 
            for row in result
        ]
        self._bytesRead += len(json.dumps(output))
        return jsonify(output), 200
    
    def add_to_viewlist(self, user_id, movie_id, rating):
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
            return jsonify({"message": "Rating updated"}), 200