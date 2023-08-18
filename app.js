const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

const convertResponseToDbObject = (each) => {
  return {
    player_name: each.playerName,
    jersey_number: each.jerseyNumber,
    role: each.role,
  };
};

// GET Players

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM cricket_team
`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

// ADD Players

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const playerChangedDetails = convertResponseToDbObject(playerDetails);
  const { player_name, jersey_number, role } = playerChangedDetails;
  const addPlayerQuery = ` 
      INSERT INTO 
      cricket_team(player_name,
      jersey_number,
      role)
      values(
          '${player_name}',
           ${jersey_number},
          '${role}'
      );
  `;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

// GET Player with ID
app.get("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  const getPlayerQuery = `
        SELECT *
        FROM cricket_team
        WHERE player_id = ${playerId};
    `;
  let player = await db.get(getPlayerQuery);
  let convertedPlayer = convertDbObjectToResponseObject(player);
  response.send(convertedPlayer);
});

// Update Player

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const playerChangedDetails = convertResponseToDbObject(playerDetails);
  const { player_name, jersey_number, role } = playerChangedDetails;
  const updatePlayerQuery = `
    UPDATE
      cricket_team
    SET
      player_name='${player_name}',
      jersey_number=${jersey_number},
      role= '${role}'
    WHERE
      player_id = ${playerId};`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

// Delete player
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
