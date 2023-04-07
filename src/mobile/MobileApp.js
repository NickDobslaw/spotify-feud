import {useEffect, useState} from "react";
import "./MobileApp.css";
import {Buffer} from "buffer";
import blueLogo from "../images/blueLogo.png";
import useSound from "use-sound";
import rightSound from "../sounds/feud-good-answer.mp3";
import wrongSound from "../sounds/feud-strike-sound.mp3";
import themeSound from "../sounds/family-feud-theme.mp3";
import winSound from "../sounds/feud-round-win.mp3";
import textLogo from "../images/textLogo.png";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faVolumeHigh} from "@fortawesome/free-solid-svg-icons";
import {faVolumeXmark} from "@fortawesome/free-solid-svg-icons";

function MobileApp() {
  const clientId = "8c307a26103a46938a902a46e8ac59a8";
  const clientSecret = "eaf9ea34a9d941f39c4f825442b4b821";
  const redirectUri = "https://NickDobslaw.github.io/spotify-feud";

  const [playRight] = useSound(rightSound, {volume: 0.25});
  const [playWrong] = useSound(wrongSound, {volume: 0.5});
  const [playTheme] = useSound(themeSound, {volume: 0.2});
  const [playWin] = useSound(winSound, {volume: 0.8});

  const [token, setToken] = useState("");
  const [mute, toggleMute] = useState(false);
  const [guessText, setGuessText] = useState("");
  const [topTracks, setTopTracks] = useState([]);
  const [topTracksLC, setTopTracksLC] = useState([]);
  const [gameOption, setGameOption] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [topArtists, setTopArtists] = useState([]);
  const [topArtistsLC, setTopArtistsLC] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [answered, setAnswered] = useState([]);
  const [artistData, setArtistData] = useState([]);
  const [gameTitle, setGameTitle] = useState("");
  const [relatedArtists, setRelatedArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(undefined);
  const [artistTopTracks, setArtistTopTracks] = useState(undefined);
  const [artistTopTracksLC, setArtistTopTracksLC] = useState(undefined);
  const [nonMusicData, setNonMusicData] = useState(undefined);
  const [xs, setXs] = useState("");
  const [volumeIcon, setVolumeIcon] = useState(faVolumeHigh);

  function generateRandomString(length) {
    let text = "";
    let possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  async function generateCodeChallenge(codeVerifier) {
    function base64encode(string) {
      return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);

    return base64encode(digest);
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("code") && !token) {
      document.getElementById("loginButton").style.display = "none";
      document.getElementById("enterButton").style.display = "block";
    }

    // if (!token && localStorage.accessToken) setToken(localStorage.accessToken);
    // const hash = window.location.hash;
    // let token = window.localStorage.getItem("token");
    // let urlParams = new URLSearchParams(window.location.hash.replace("#", "?"));
    // let token2 = urlParams.get("access_token");
    // setToken2(token2);
    // // getToken()
    // if (!token && hash) {
    //   token = hash
    //     .substring(1)
    //     .split("&")
    //     .find((elem) => elem.startsWith("access_token"))
    //     .split("=")[1];
    //   window.location.hash = "";
    //   window.localStorage.setItem("token", token);
    // }
    // setToken(token);
  }, []);
  async function authorize() {
    let codeVerifier = generateRandomString(128);
    console.log(codeVerifier);

    generateCodeChallenge(codeVerifier).then((codeChallenge) => {
      let state = generateRandomString(16);
      let scope = "user-top-read";

      localStorage.setItem("codeVerifier", codeVerifier);

      let args = new URLSearchParams({
        response_type: "code",
        client_id: clientId,
        scope: scope,
        redirect_uri: redirectUri,
        state: state,
      });

      window.location = "https://accounts.spotify.com/authorize?" + args;
    });
  }

  async function request() {
    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get("code");

    let body = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri,
    });

    const response = fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          new Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      },
      body: body,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("HTTP status " + response.status);
        }
        return response.json();
      })
      .then((data) => {
        localStorage.setItem("access-token", data.access_token);
        setToken(data.access_token);
        document.getElementById("blueLogo").style.display = "none";
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  const logout = () => {
    document.getElementById("blueLogo").style.display = "block";
    setToken("");
    window.localStorage.removeItem("accessToken");
    let urlParams = new URLSearchParams(window.location.search);
    urlParams.delete("code");
  };

  async function getArtistData() {
    return await fetchWebApi(
      `v1/search?query=${searchKey}&type=artist&locale=en-US%2Cen%3Bq%3D0.9&limit=10`,
      "GET"
    );
  }

  async function logArtistData() {
    const artistData = await getArtistData();
    console.log(artistData.artists.items);
    setArtistData(artistData.artists.items);
  }

  async function getRelated(id) {
    return await fetchWebApi(`v1/artists/${id}/related-artists`, "GET");
  }

  async function logRelated(artist) {
    const artistData = await getRelated(artist.id);
    let tempData = artistData.artists.map((artist) => {
      return artist.name.toLowerCase();
    });
    tempData = tempData.slice(0, 8);
    let answerData = artistData.artists.map((ar) => {
      if (ar.name.length > 17) return ar.name.slice(0, 17) + "...";
      else return ar.name;
    });
    answerData = answerData.slice(0, 8);
    console.log(tempData);
    console.log(answerData);
    setAnswers(answerData);
    setRelatedArtists(tempData);
    setGameTitle(artist.name + "'s Related Artists");
    document.getElementById("artistSearchMobile").style.display = "none";
    displayGameBoard();
  }

  async function getArtistTopTracks(id) {
    return await fetchWebApi(`v1/artists/${id}/top-tracks?market=ES`, "GET");
  }

  async function logArtistTopTracks(artist) {
    const artistData = await getArtistTopTracks(artist.id);
    console.log(artistData.tracks);
    let tempData = artistData.tracks.map((track) => {
      let name = track.name;
      let nameLC = name.toLowerCase();
      if (name.includes("-")) name = name.slice(0, name.indexOf("-")).trim();
      if (name.includes("(")) name = name.slice(0, name.indexOf("(")).trim();
      if (nameLC.includes("feat"))
        name = name.slice(0, nameLC.indexOf("feat")).trim();
      return name.trim();
    });
    let answerData = artistData.tracks.map((track) => {
      if (track.name.length > 15) return track.name.slice(0, 15).trim() + "...";
      else return track.name.trim();
    });
    if (tempData.length > 8) {
      tempData = tempData.slice(0, 8);
      answerData = answerData.slice(0, 8);
    }
    setArtistTopTracks(tempData);
    setAnswers(answerData);
    let tempArtistTracksLC = tempData.map((str) => str.toLowerCase());
    setArtistTopTracksLC(tempArtistTracksLC);
    setGameTitle(artist.name + "'s Top Tracks");
    document.getElementById("artistSearch").style.display = "none";
    displayGameBoard();
  }

  async function fetchWebApi(endpoint, method, body) {
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method,
      body: JSON.stringify(body),
    });
    return await res.json();
  }

  async function getTopTracks() {
    return (
      await fetchWebApi("v1/me/top/tracks?time_range=long_term&limit=8", "GET")
    ).items;
  }

  async function assignTopTracks() {
    const topTracks = await getTopTracks();
    getProfile();
    let tempTracks = topTracks.map((track) => {
      return {
        name: track.name,
        artist: track.artists[0].name,
      };
    });
    let tempData = tempTracks.map((track) => {
      let name = track.name;
      let nameLC = name.toLowerCase();
      if (name.includes("-")) name = name.slice(0, name.indexOf("-")).trim();
      if (name.includes("(")) name = name.slice(0, name.indexOf("(")).trim();
      if (nameLC.includes("feat"))
        name = name.slice(0, nameLC.indexOf("feat")).trim();
      return name.trim();
    });
    let answerData = tempTracks.map((track) => {
      if (track.name.length > 15) return track.name.slice(0, 15).trim() + "...";
      else return track.name.trim();
    });
    setTopTracks(tempTracks);
    setAnswers(answerData);
    let tempTracksLC = tempData.map((track) => track.toLowerCase());
    setTopTracksLC(tempTracksLC);
  }

  async function getTopArtists() {
    return (
      await fetchWebApi("v1/me/top/artists?time_range=long_term&limit=8", "GET")
    ).items;
  }

  function assignNonMusic(option) {
    let tempData = [];
    switch (option) {
      case "Dog Breeds":
        tempData = [
          "French Bulldog",
          "Labrador Retriever",
          "Golden Retriever",
          "German Shepherd",
          "Poodle",
          "Bulldog",
          "Rottweiler",
          "Beagle",
        ];
        break;
      case "Fast Food":
        tempData = [
          "McDonald's",
          "Starbucks",
          "Subway",
          "Taco Bell",
          "Chick-Fil-A",
          "Wendy's",
          "Burger King",
          "Dunkin",
        ];
        break;
      case "Pixar Films":
        tempData = [
          "Toy Story 2",
          "Toy Story",
          "Finding Nemo",
          "Inside Out",
          "Up",
          "Coco",
          "The Incredibles",
          "Monsters, Inc.",
        ];
        break;
      case "Disney Channel Shows":
        tempData = [
          "That's So Raven",
          "The Suite Life of Zack & Cody",
          "The Proud Family",
          "Kim Possible",
          "Phineas and Ferb",
          "Wizards of Waverly Place",
          "Hannah Montana",
          "Lilo & Stitch",
        ];
        break;
      case "Cartoon Network Shows":
        tempData = [
          "Foster's Home For Imaginary Friends",
          "Courage the Cowardly Dog",
          "The Powerpuff Girls",
          "Dexter's Laboratory",
          "Teen Titans",
          "The Grim Adventures of Billy & Mandy",
          "Adventure Time",
          "Regular Show",
        ];
        break;
      default:
        break;
    }
    console.log(tempData);
    setNonMusicData(tempData.map((data) => data.toLowerCase()));
    setAnswers(
      tempData.map((data) => {
        if (data.length > 17) return data.slice(0, 17) + "...";
        else return data;
      })
    );
  }

  async function assignTopArtists() {
    const topArtists = await getTopArtists();
    let tempArtists = topArtists.map((artist) => artist.name);
    setTopArtists(tempArtists);
    console.log(tempArtists);
    setAnswers(tempArtists);
    let tempArtistsLC = tempArtists.map((str) => str.toLowerCase());
    setTopArtistsLC(tempArtistsLC);
  }

  async function getProfile() {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const data = await response.json();
    console.log(data);
  }

  function displayGameBoard() {
    if (!mute) playTheme();
    document.getElementById("gameBoardMobile").style.display = "block";
    document.getElementById("gameOptionsMobile").style.display = "none";
    document.getElementById("nonMusicGameOptionsMobile").style.display = "none";
    document
      .getElementById("guessInputMobile")
      .addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          document.getElementById("guessButtonMobile").click();
        }
      });
  }

  function giveHint() {
    let compArray = undefined;
    switch (gameOption) {
      case "Top Artists":
        compArray = [...topArtistsLC];
        break;
      case "Top Tracks":
        compArray = [...topTracksLC];
        break;
      case "Artists Top Tracks":
        compArray = [...artistTopTracksLC];
        break;
      case "Related":
        compArray = [...relatedArtists];
        break;
      case "Dog Breeds":
      case "Fast Food":
      case "Disney Channel Shows":
      case "Pixar Films":
      case "Cartoon Network Shows":
        compArray = [...nonMusicData];
        break;
      default:
        compArray = [...nonMusicData];
        break;
    }
    let i = compArray.length - 1;
    let hintSwitch = true;
    while (hintSwitch) {
      if (
        !answered.includes(compArray[i]) &&
        answered.length !== compArray.length
      ) {
        if (!mute) playRight();
        document.getElementById(`listItem${i + 1}Mobile`).style.display =
          "none";
        document.getElementById(`correct${i + 1}Mobile`).style.display =
          "block";
        let tempAnswered = [...answered];
        tempAnswered.push(compArray[i]);
        if (tempAnswered.length === compArray.length) displayWin();
        setAnswered(tempAnswered);
        hintSwitch = false;
      }
      i--;
    }
  }

  function makeGuess() {
    let compArray = undefined;
    switch (gameOption) {
      case "Top Artists":
        compArray = [...topArtistsLC];
        break;
      case "Top Tracks":
        compArray = [...topTracksLC];
        break;
      case "Artists Top Tracks":
        compArray = [...artistTopTracksLC];
        break;
      case "Related":
        compArray = [...relatedArtists];
        break;
      case "Dog Breeds":
      case "Fast Food":
      case "Disney Channel Shows":
      case "Pixar Films":
        compArray = [...nonMusicData];
        break;
      default:
        break;
    }
    console.log(compArray);
    if (!answered.includes(guessText.toLowerCase())) setGuessText("");
    if (compArray.includes(guessText.toLowerCase())) {
      if (!answered.includes(guessText.toLowerCase())) {
        if (!mute) playRight();
        let index = compArray.indexOf(guessText.toLowerCase());
        document.getElementById(`listItem${index + 1}Mobile`).style.display =
          "none";
        document.getElementById(`correct${index + 1}Mobile`).style.display =
          "block";
        let tempAnswered = [...answered];
        tempAnswered.push(guessText.toLowerCase());
        if (tempAnswered.length === compArray.length) displayWin();
        setAnswered(tempAnswered);
      }
    } else {
      if (guessText.length > 0) {
        if (xs.length === 0) {
          setXs("X");
          if (!mute) playWrong();
          document.getElementById("xsMobile").style.display = "block";
          document.getElementById("guessInputMobile").disabled = true;
          setTimeout(() => {
            document.getElementById("xsMobile").style.display = "none";
            document.getElementById("guessInputMobile").disabled = false;
            document.getElementById("guessInputMobile").focus();
            document.getElementById("guessInputMobile").select();
          }, 1500);
        } else if (xs.length === 1) {
          let tempX = xs;
          tempX += " X";
          setXs(tempX);
          if (!mute) playWrong();
          document.getElementById("xsMobile").style.display = "block";
          document.getElementById("guessInputMobile").disabled = true;
          setTimeout(() => {
            document.getElementById("xsMobile").style.display = "none";
            document.getElementById("guessInputMobile").disabled = false;
            document.getElementById("guessInputMobile").focus();
            document.getElementById("guessInputMobile").select();
          }, 1500);
        } else if (xs.length === 3) {
          let tempX = xs;
          tempX += " X";
          setXs(tempX);
          if (!mute) playWrong();
          document.getElementById("xsMobile").style.display = "block";
          document.getElementById("guessInputMobile").disabled = true;
        }
      }
    }
  }

  function displayWin() {
    console.log("Win");
    playWin();
    document.getElementById("guessInputMobile").disabled = true;
  }

  return (
    <div className="App">
      <header className="App-header">
        <img alt="" className="blueLogo" id="blueLogo" src={blueLogo} />
        <img alt="" className="textLogoMobile" src={textLogo}></img>
        {!token ? (
          <>
            <button
              className="loginButton"
              id="loginButton"
              onClick={authorize}
            >
              Log In with Spotify
            </button>
            <button className="enterButton" id="enterButton" onClick={request}>
              Start
            </button>
          </>
        ) : (
          <>
            <a
              class="active"
              onClick={() => {
                toggleMute(!mute);
                if (volumeIcon === faVolumeHigh) setVolumeIcon(faVolumeXmark);
                else setVolumeIcon(faVolumeHigh);
              }}
              style={{cursor: "pointer"}}
            >
              <FontAwesomeIcon
                style={{display: "inline-block", marginLeft: "20px"}}
                className="volumeIcon"
                id="volumeIcon"
                size="xl"
                color="white"
                icon={volumeIcon}
              />
            </a>
            <a
              class="active"
              onClick={() => {
                toggleMute(!mute);
                if (volumeIcon === faVolumeHigh) setVolumeIcon(faVolumeXmark);
                else setVolumeIcon(faVolumeHigh);
              }}
              style={{cursor: "pointer"}}
            >
              <FontAwesomeIcon
                style={{display: "inline-block", marginLeft: "20px"}}
                className="volumeIcon"
                id="xIcon"
                size="xl"
                color="white"
                icon={volumeIcon}
              />
            </a>
            <div id="gameTypeOptionsMobile" className="gameOptionsMobile">
              <button
                onClick={() => {
                  document.getElementById(
                    "gameTypeOptionsMobile"
                  ).style.display = "none";
                  document.getElementById("gameOptionsMobile").style.display =
                    "block";
                }}
              >
                Music-Related
              </button>
              <button
                onClick={() => {
                  document.getElementById(
                    "gameTypeOptionsMobile"
                  ).style.display = "none";
                  document.getElementById(
                    "nonMusicGameOptionsMobile"
                  ).style.display = "block";
                }}
              >
                Not Music-Related
              </button>
            </div>
            <div
              id="nonMusicGameOptionsMobile"
              style={{display: "none"}}
              className="gameOptionsMobile"
            >
              <button
                onClick={() => {
                  setGameOption("Dog Breeds");
                  assignNonMusic("Dog Breeds");
                  displayGameBoard();
                }}
              >
                Dog Breeds
              </button>
              <button
                onClick={() => {
                  setGameOption("Fast Food");
                  assignNonMusic("Fast Food");
                  displayGameBoard();
                }}
              >
                Fast Food
              </button>
              <button
                onClick={() => {
                  setGameOption("Pixar Films");
                  assignNonMusic("Pixar Films");
                  displayGameBoard();
                }}
              >
                Pixar Films
              </button>
              <button
                onClick={() => {
                  setGameOption("Disney Channel Shows");
                  assignNonMusic("Disney Channel Shows");
                  displayGameBoard();
                }}
              >
                Disney Channel Shows
              </button>
              <button
                onClick={() => {
                  setGameOption("Cartoon Network Shows");
                  assignNonMusic("Cartoon Network Shows");
                  displayGameBoard();
                }}
              >
                Cartoon Network Shows
              </button>
            </div>
            <div
              id="gameOptionsMobile"
              style={{display: "none"}}
              className="gameOptionsMobile"
            >
              <button
                onClick={() => {
                  setGameOption("Top Tracks");
                  assignTopTracks();
                  displayGameBoard();
                }}
              >
                Top Tracks
              </button>
              <button
                onClick={() => {
                  setGameOption("Top Artists");
                  assignTopArtists();
                  displayGameBoard();
                }}
              >
                Top Artists
              </button>
              <button
                onClick={() => {
                  document.getElementById("gameOptions").style.display = "none";
                  document.getElementById("artistSearch").style.display =
                    "block";
                  document
                    .getElementById("searchInput")
                    .addEventListener("keypress", function (event) {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        document.getElementById("searchButton").click();
                      }
                    });
                  setGameOption("Artists Top Tracks");
                }}
              >
                Artist's Top Tracks
              </button>
              <button
                onClick={() => {
                  document.getElementById("gameOptions").style.display = "none";
                  document.getElementById("artistSearch").style.display =
                    "block";
                  document
                    .getElementById("searchInput")
                    .addEventListener("keypress", function (event) {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        document.getElementById("searchButton").click();
                      }
                    });
                  setGameOption("Related");
                }}
              >
                Related Artists
              </button>
            </div>
            <div
              className="artistSearchMobile"
              id="artistSearch"
              style={{display: "none"}}
            >
              <input
                autoComplete="off"
                onChange={(e) => {
                  setSearchKey(e.target.value);
                }}
                style={{marginTop: "30px"}}
                type="text"
                id="searchInput"
                value={searchKey}
              ></input>
              <button
                id="searchButton"
                className="guessButton"
                onClick={logArtistData}
              >
                Search
              </button>
              <div>
                {artistData.map((artist, index) => {
                  return (
                    <>
                      {index % 2 === 0 ? (
                        <div>
                          <a
                            class="active"
                            style={{cursor: "pointer"}}
                            onClick={() => {
                              setSelectedArtist(artist.name);
                              if (gameOption === "Artists Top Tracks")
                                logArtistTopTracks(artist);
                              if (gameOption === "Related") logRelated(artist);
                            }}
                          >
                            <div
                              className="artistBlock"
                              style={{display: "inline-block"}}
                            >
                              {artist.images.length > 0 ? (
                                <div className="artistImgWrapper">
                                  <img
                                    style={{display: "inline-block"}}
                                    alt=""
                                    src={artist.images[0].url}
                                  />
                                </div>
                              ) : (
                                ""
                              )}
                              <h4 style={{display: "inline-block"}}>
                                {artist.name.length > 15
                                  ? artist.name.slice(0, 15) + "..."
                                  : artist.name}
                              </h4>
                            </div>
                          </a>
                          <a
                            class="active"
                            style={{cursor: "pointer"}}
                            onClick={() => {
                              setSelectedArtist(artistData[index + 1]);
                              if (gameOption === "Artists Top Tracks")
                                logArtistTopTracks(artistData[index + 1]);
                              if (gameOption === "Related")
                                logRelated(artistData[index + 1]);
                            }}
                          >
                            <div
                              className="artistBlock"
                              style={{
                                alignItems: "center",
                                display: "inline-block",
                              }}
                            >
                              {artistData[index + 1].images.length > 0 ? (
                                <div className="artistImgWrapper">
                                  <img
                                    style={{display: "inline-block"}}
                                    alt=""
                                    src={artistData[index + 1].images[0].url}
                                  />
                                </div>
                              ) : (
                                ""
                              )}
                              <h4 style={{display: "inline-block"}}>
                                {artistData[index + 1].name.length > 15
                                  ? artistData[index + 1].name.slice(0, 15) +
                                    "..."
                                  : artistData[index + 1].name}
                              </h4>
                            </div>
                          </a>
                        </div>
                      ) : (
                        ""
                      )}
                    </>
                  );
                })}
              </div>
            </div>
            <div id="gameBoardMobile" className="gameBoardMobile">
              <h2>{gameTitle ? gameTitle : gameOption}</h2>
              <div className="board">
                <div style={{display: "inline-block"}} className="column1">
                  {answers.length > 0 ? (
                    <>
                      <div id="listItem1Mobile" className="listItem1Mobile">
                        <div className="oval">1</div>
                      </div>
                      <div id="correct1Mobile" className="correct1Mobile">
                        <h2>{answers[0]}</h2>
                      </div>
                    </>
                  ) : (
                    <div id="listItem1Mobile" className="listItem1Mobile"></div>
                  )}
                  {answers.length > 1 ? (
                    <>
                      <div id="listItem2Mobile" className="listItem2Mobile">
                        <div className="oval">2</div>
                      </div>
                      <div id="correct2Mobile" className="correct2Mobile">
                        <h2>{answers[1]}</h2>
                      </div>
                    </>
                  ) : (
                    <div id="listItem2Mobile" className="listItem2Mobile" />
                  )}
                  {answers.length > 2 ? (
                    <>
                      <div id="listItem3Mobile" className="listItem3Mobile">
                        <div className="oval">3</div>
                      </div>
                      <div id="correct3Mobile" className="correct3Mobile">
                        <h2>{answers[2]}</h2>
                      </div>
                    </>
                  ) : (
                    <div id="listItem3Mobile" className="listItem3Mobile" />
                  )}
                  {answers.length > 3 ? (
                    <>
                      <div id="listItem4Mobile" className="listItem4Mobile">
                        <div className="oval">4</div>
                      </div>
                      <div id="correct4Mobile" className="correct4Mobile">
                        <h2> {answers[3]}</h2>
                      </div>
                    </>
                  ) : (
                    <div id="listItem4Mobile" className="listItem4Mobile" />
                  )}
                </div>
                <div style={{display: "inline-block"}} className="column2">
                  {answers.length > 4 ? (
                    <>
                      <div id="listItem5Mobile" className="listItem5Mobile">
                        <div className="oval">5</div>
                      </div>
                      <div id="correct5Mobile" className="correct5Mobile">
                        <h2>{answers[4]}</h2>
                      </div>
                    </>
                  ) : (
                    <div id="listItem5Mobile" className="listItem5Mobile" />
                  )}
                  {answers.length > 5 ? (
                    <>
                      <div id="listItem6Mobile" className="listItem6Mobile">
                        <div className="oval">6</div>
                      </div>
                      <div id="correct6Mobile" className="correct6Mobile">
                        <h2>{answers[5]}</h2>
                      </div>
                    </>
                  ) : (
                    <div id="listItem6Mobile" className="listItem6Mobile" />
                  )}
                  {answers.length > 6 ? (
                    <>
                      <div id="listItem7Mobile" className="listItem7Mobile">
                        <div className="oval">7</div>
                      </div>
                      <div id="correct7Mobile" className="correct7Mobile">
                        <h2>{answers[6]}</h2>
                      </div>
                    </>
                  ) : (
                    <div id="listItem7Mobile" className="listItem7Mobile" />
                  )}
                  {answers.length > 7 ? (
                    <>
                      <div id="listItem8Mobile" className="listItem8Mobile">
                        <div className="oval">8</div>
                      </div>
                      <div id="correct8Mobile" className="correct8Mobile">
                        <h2>{answers[7]}</h2>
                      </div>
                    </>
                  ) : (
                    <div id="listItem8Mobile" className="listItem8Mobile" />
                  )}
                </div>
              </div>
              <br />
              <div>
                <button
                  id="hintButton"
                  className="guessButtonMobile"
                  onClick={giveHint}
                >
                  Hint
                </button>
                <input
                  autoComplete="off"
                  onChange={(e) => {
                    setGuessText(e.target.value);
                  }}
                  type="text"
                  id="guessInputMobile"
                  name="guess"
                  value={guessText}
                ></input>
                <button
                  id="guessButtonMobile"
                  className="guessButtonMobile"
                  onClick={makeGuess}
                >
                  Guess
                </button>
              </div>
            </div>
            <div id="xsMobile" style={{}} className="xsMobile">
              {xs}
            </div>
            <br />
            <div>
              <button className="logoutButton" onClick={logout}>
                Logout
              </button>
            </div>
          </>
        )}
      </header>
    </div>
  );
}

export default MobileApp;
