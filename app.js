const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const databasePath = path.join(__dirname, "moviesData.db");

let dataBase = null;

const initializeDBAndServer = async () => {
  try {
    dataBase = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertCaseOFKeysInMovieDataBase = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertCaseOFKeysInDirectorDataBase = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

// GET MOVIES API
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name FROM movie;`;

  const moviesArray = await dataBase.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => convertCaseOFKeysInMovieDataBase(eachMovie))
  );
});

// GET DIRECTORS API
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT * FROM director;`;

  const directorsArray = await dataBase.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) =>
      convertCaseOFKeysInDirectorDataBase(eachDirector)
    )
  );
});

// POST MOVIES API
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
    INSERT INTO movie (director_id, movie_name, lead_actor)
    VALUES (${directorId}, '${movieName}', '${leadActor}');
    `;
  const postMovie = await dataBase.run(postMovieQuery);

  response.send("Movie Successfully Added");
});

// GET MOVIE API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT * FROM movie WHERE movie_id = ${movieId};`;

  const movieDetails = await dataBase.get(getMovieQuery);
  response.send(convertCaseOFKeysInMovieDataBase(movieDetails));
});

// PUT MOVIE API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
    UPDATE movie
    SET 
        director_id = ${directorId},
        movie_name = "${movieName}",
        lead_actor = "${leadActor}"
    WHERE movie_id = ${movieId}; `;

  await dataBase.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// DELETE MOVIE API
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie WHERE movie_id = ${movieId};`;

  await dataBase.run(deleteMovieQuery);
  response.send("Movie Removed");
});

// GET DIRECTOR MOVIES API
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT movie_name FROM movie WHERE director_id = ${directorId};
    `;

  const directorMoviesArray = await dataBase.all(getDirectorMoviesQuery);
  response.send(
    directorMoviesArray.map((eachMovie) =>
      convertCaseOFKeysInMovieDataBase(eachMovie)
    )
  );
});

module.exports = app;
