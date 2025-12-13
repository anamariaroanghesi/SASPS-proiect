-- Adminer 5.4.1 PostgreSQL 18.1 dump

DROP DATABASE IF EXISTS "moviedb";
CREATE DATABASE "moviedb";
\connect "moviedb";

DROP TABLE IF EXISTS "directors";
DROP SEQUENCE IF EXISTS directors_id_seq;
CREATE SEQUENCE directors_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."directors" (
    "id" integer DEFAULT nextval('directors_id_seq') NOT NULL,
    "name" character(40) NOT NULL,
    CONSTRAINT "directors_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

INSERT INTO "directors" ("id", "name") VALUES
(1,	'Christopher Nolan                       '),
(2,	'Denis Villeneuve                        '),
(3,	'Tim Miller                              '),
(4,	'Frank Darabont                          '),
(5,	'Quentin Tarantino                       ');

DROP TABLE IF EXISTS "genres";
DROP SEQUENCE IF EXISTS genres_id_seq;
CREATE SEQUENCE genres_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."genres" (
    "id" integer DEFAULT nextval('genres_id_seq') NOT NULL,
    "name" character(20) NOT NULL,
    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

INSERT INTO "genres" ("id", "name") VALUES
(1,	'Sci-Fi              '),
(2,	'Comedy              '),
(3,	'Drama               '),
(4,	'Action              ');

DROP TABLE IF EXISTS "movie_details";
DROP SEQUENCE IF EXISTS movie_details_id_seq;
CREATE SEQUENCE movie_details_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."movie_details" (
    "id" integer DEFAULT nextval('movie_details_id_seq') NOT NULL,
    "director_id" integer NOT NULL,
    "genre_id" integer NOT NULL,
    "synopsis" character(200) NOT NULL,
    CONSTRAINT "movie_details_pkey" PRIMARY KEY ("id")
)
WITH (oids = false);

INSERT INTO "movie_details" ("id", "director_id", "genre_id", "synopsis") VALUES
(1,	1,	1,	'A group of astronauts who travel through a wormhole near Saturn in search of a new home for mankind.                                                                                                    '),
(2,	2,	1,	'A linguistics expert must interpret the language of aliens who have come to Earth in a mysterious spaceship.                                                                                            '),
(3,	3,	2,	'A mercenary superhero sets out to track the man who gave him superpowers.                                                                                                                               '),
(4,	4,	3,	'A banker is sent to a maximum security prison and must adapt to life in jail.                                                                                                                           '),
(5,	5,	4,	'Several characters go through intertwining adrenaline-fueled adventures.                                                                                                                                '),
(6,	5,	4,	'A group of Jewish-American soldiers set out to brutally kill Nazi officers.                                                                                                                             ');

DROP TABLE IF EXISTS "movies";
DROP SEQUENCE IF EXISTS movies_id_seq;
CREATE SEQUENCE movies_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."movies" (
    "id" integer DEFAULT nextval('movies_id_seq') NOT NULL,
    "title" character varying(100) NOT NULL,
    "year" numeric(4,0) NOT NULL
)
WITH (oids = false);

CREATE UNIQUE INDEX movies_id_key ON public.movies USING btree (id);

INSERT INTO "movies" ("id", "title", "year") VALUES
(1,	'Interstellar',	2014),
(2,	'Arrival',	2016),
(3,	'Deadpool',	2016),
(4,	'The Shawshank Redemption',	1994),
(5,	'Pulp Fiction',	1994),
(6,	'Inglorious Basterds',	2009);

-- 2025-12-12 20:27:43 UTC

-- Users table
CREATE TABLE "public"."users" (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(50) NOT NULL UNIQUE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Watchlist (many-to-many: users <-> movies)
CREATE TABLE "public"."watchlist" (
    "user_id" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "movie_id" INTEGER NOT NULL,
    "added_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, movie_id)
);

-- Viewed movies with ratings
CREATE TABLE "public"."viewed" (
    "user_id" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "movie_id" INTEGER NOT NULL,
    "rating" INTEGER CHECK (rating >= 1 AND rating <= 5),
    "viewed_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, movie_id)
);

-- Insert a test user
INSERT INTO "users" ("id", "username") VALUES (1, 'testuser');