from flask import Flask, request, jsonify, Response
import psycopg2
import os

app = Flask(__name__)

@app.route("/movies", methods=["GET"])
def get_movies():
    conn = psycopg2.connect(host = "db",
                            database = os.environ["POSTGRES_DB"],
                            user = os.environ["POSTGRES_USER"],
                            password = os.environ["POSTGRES_PASSWORD"])
    cur = conn.cursor()  
    cur.execute("SELECT * FROM movies;")
    result = cur.fetchall()
    cur.close()
    conn.close()
    output = []
    for row in result:
        output.append({"id":int(row[0]), "name":row[1], "year":int(row[2])})
    return output, 200

@app.route("/movies/<int:movie_id>", methods=["GET"])
def get_movie_by_id(movie_id):
    conn = psycopg2.connect(host = "db",
                            database = os.environ["POSTGRES_DB"],
                            user = os.environ["POSTGRES_USER"],
                            password = os.environ["POSTGRES_PASSWORD"])
    cur = conn.cursor()  
    cur.execute("""SELECT movies.id, movies.title, movies.year, directors.name, genres.name, movie_details.synopsis 
                FROM movies INNER JOIN movie_details ON movies.id = movie_details.id
                INNER JOIN directors ON movie_details.director_id = directors.id
                INNER JOIN genres ON movie_details.genre_id = genres.id
                WHERE movies.id = %s;""", (movie_id,))
    result = cur.fetchall()
    cur.close()
    conn.close()
    if (len(result) == 0):
        return Response(status=404)
    row = result[0]
    output = {"id":int(row[0]), "title":row[1], "year":int(row[2]), "director":row[3], "genre":row[4], "synopsis":row[5]}
    return output, 200

@app.route("/users/<int:user_id>/watchlist", methods=["GET"])
def get_user_watchlist(user_id):
    return Response(status=418)

@app.route("/users/<int:user_id>/watchlist", methods=["POST"])
def post_user_watchlist(user_id):
    return Response(status=418)

@app.route("/users/<int:user_id>/viewed", methods=["GET"])
def get_user_viewed(user_id):
    return Response(status=418)

@app.route("/users/<int:user_id>/viewed", methods=["POST"])
def post_user_viewed(user_id):
    return Response(status=418)

@app.route("/users/<int:user_id>/watchlist/<int:movie_id>", methods=["DELETE"])
def delete_movie_from_watchlist(user_id, movie_id):
    return Response(status=418)

@app.route("/users/<int:user_id>/viewed/<int:movie_id>", methods=["DELETE"])
def delete_movie_from_viewed(user_id, movie_id):
    return Response(status=418)

if __name__ == '__main__':
    app.run('0.0.0.0', debug=True)
