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
import {faToggleOn, faToggleOff} from "@fortawesome/free-solid-svg-icons";

function MobileApp() {
  const clientId = "8c307a26103a46938a902a46e8ac59a8";
  const clientSecret = "eaf9ea34a9d941f39c4f825442b4b821";
  const redirectUri = "https://NickDobslaw.github.io/spotify-feud";
  //const redirectUri = "http://localhost:3000";

  const [playRight] = useSound(rightSound, {volume: 0.25});
  const [playWrong] = useSound(wrongSound, {volume: 0.5});
  const [playTheme] = useSound(themeSound, {volume: 0.2});
  const [playWin] = useSound(winSound, {volume: 0.8});

  const [token, setToken] = useState("");
  const [mute, toggleMute] = useState(false);
  const [albumMode, setAlbumMode] = useState(false);
  const [noFailMode, setNoFailMode] = useState(false);
  const [guessText, setGuessText] = useState("");
  const [topTracks, setTopTracks] = useState([]);
  const [albumComp, setAlbumComp] = useState(0);
  const [albumTopTracks, setAlbumTopTracks] = useState([]);
  const [topTracksLC, setTopTracksLC] = useState([]);
  const [gameOption, setGameOption] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [artistAlbums, setArtistAlbums] = useState([]);
  const [albumGameData, setAlbumGameData] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [topArtistsLC, setTopArtistsLC] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [answered, setAnswered] = useState([]);
  const [artistData, setArtistData] = useState([]);
  const [gameTitle, setGameTitle] = useState("");
  const [relatedArtists, setRelatedArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(undefined);
  const [selectedAlbum, setSelectedAlbum] = useState(undefined);
  const [artistTopTracks, setArtistTopTracks] = useState(undefined);
  const [artistTopTracksLC, setArtistTopTracksLC] = useState(undefined);
  const [nonMusicData, setNonMusicData] = useState(undefined);
  const [xs, setXs] = useState("");
  const [volumeIcon, setVolumeIcon] = useState(faVolumeHigh);
  const [noFailIcon, setNoFailIcon] = useState(faToggleOff);

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
      document.getElementById("blueLogo").style.display = "none";
      document.getElementById("loginButton").style.display = "none";
      document.getElementById("textLogoMobile").style.display = "none";
      request();
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

  useEffect(() => {
    if (albumComp === albumTopTracks.length) logAlbumGameData();
  }, [albumComp]);

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
    document.getElementById("textLogoMobile").style.display = "block";
    setToken("");
    window.localStorage.removeItem("accessToken");
    let urlParams = new URLSearchParams(window.location.search);
    urlParams.delete("code");
  };

  async function getArtistData() {
    return await fetchWebApi(
      `v1/search?query=${searchKey}&type=artist&locale=en-US%2Cen%3Bq%3D0.9&limit=5`,
      "GET"
    );
  }

  async function logArtistData() {
    setAlbumMode(false);
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
      if (ar.name.length > 16) return ar.name.slice(0, 15) + "...";
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
      if (name.includes(" - "))
        name = name.slice(0, name.indexOf(" - ")).trim();
      if (name.includes("|")) name = name.slice(0, name.indexOf("|")).trim();
      if (name.includes("(")) name = name.slice(0, name.indexOf("(")).trim();
      if (nameLC.includes("feat"))
        name = name.slice(0, nameLC.indexOf("feat")).trim();
      return name.trim();
    });
    let answerData = artistData.tracks.map((track) => {
      if (track.name.length > 16) return track.name.slice(0, 15).trim() + "...";
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
    document.getElementById("artistSearchMobile").style.display = "none";
    displayGameBoard();
  }

  async function getArtistAlbums(id) {
    return await fetchWebApi(
      `v1/artists/${id}/albums?limit=50&include_groups=album,single`,
      "GET"
    );
  }

  async function logArtistAlbums(artist) {
    const albumData = await getArtistAlbums(artist.id);
    console.log(albumData);
    if (albumData.items.length > 0) {
      let tempData = albumData.items.filter((album) => {
        return album.total_tracks > 4 || album.album_group === "album";
      });
      tempData.forEach((data) => {
        if (data.name.includes("("))
          data.name = data.name.slice(0, data.name.indexOf("("));
        if (data.name.includes(" - "))
          data.name = data.name.slice(0, data.name.indexOf(" - "));
        data.name = data.name.trim();
      });
      tempData.reverse();
      let unique = [];
      let uniqueNames = [];
      tempData.forEach((album) => {
        if (!uniqueNames.includes(album.name)) {
          uniqueNames.push(album.name);
          unique.push(album);
        }
      });
      unique.reverse();
      console.log(unique);
      setAlbumMode(true);
      setArtistData(unique);
    }
  }

  async function getAlbumTopTracks(id) {
    return await fetchWebApi(`v1/albums/${id}/tracks?limit=50`, "GET");
  }

  async function logAlbumTopTracks(artist) {
    setSelectedAlbum(artist);
    const albumData = await getAlbumTopTracks(artist.id);
    let tempData = albumData.items;
    let trackData = [];
    tempData.forEach(async (data) => {
      await getTrackInfo(data.id).then((data) => {
        trackData.push(data);
        trackData.sort((a, b) => b.popularity - a.popularity);
        setAlbumTopTracks(trackData);
        setAlbumComp(trackData.length);
      });
    });
  }

  async function getTrackInfo(id) {
    const trackData = await fetchWebApi(`v1/tracks/${id}`, "GET");
    return trackData;
  }

  function logAlbumGameData() {
    if (albumTopTracks.length > 0) {
      let tempData = albumTopTracks.map((data) => {
        return data.name;
      });
      if (tempData.length > 8) tempData = tempData.slice(0, 8);
      let tempLC = tempData.map((str) => str.toLowerCase());
      tempLC = tempLC.map((data) => {
        if (data.includes("(")) data = data.slice(0, data.indexOf("("));
        if (data.includes(" - ")) data = data.slice(0, data.indexOf(" - "));
        if (data.includes("|")) data = data.slice(0, data.indexOf("|"));
        if (data.includes("feat")) data = data.slice(0, data.indexOf("feat"));
        if (data.includes("ft")) data = data.slice(0, data.indexOf("ft"));
        if (data.includes("[")) data = data.slice(0, data.indexOf("["));
        data = data.replace(/[\u2018\u2019]/g, "'");
        return data.trim();
      });
      let answerData = tempData.map((str) => {
        if (str.length > 16) return str.slice(0, 15) + "...";
        else return str;
      });
      console.log(tempLC);
      console.log(answerData);
      setAlbumGameData(tempLC);
      setAnswers(answerData);
      document.getElementById("artistSearchMobile").style.display = "none";
      displayGameBoard();
    }
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
      if (name.includes(" - "))
        name = name.slice(0, name.indexOf(" - ")).trim();
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
    let answerData = [];
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
      case "Nickelodeon Shows":
        tempData = [
          "Avatar: The Last Airbender",
          "SpongeBob SquarePants",
          "The Fairly OddParents",
          "iCarly",
          "Danny Phantom",
          "Ned's Declassified",
          "VICTORiOUS",
          "Jimmy Neutron",
        ];
        break;
      case "Receiving Yards 22/23":
        tempData = [
          "Justin Jefferson",
          "Tyreek Hill",
          "Davante Adams",
          "A.J. Brown",
          "Stefon Diggs",
          "CeeDee Lamb",
          "Jaylen Waddle",
          "Travis Kelce",
        ];
        break;
      case "Receiving Yards All Time":
        tempData = [
          "Jerry Rice",
          "Larry Fitzgerald",
          "Terrell Owens",
          "Randy Moss",
          "Isaac Bruce",
          "Tony Gonzalez",
          "Tim Brown",
          "Steve Smith Sr.",
        ];
        break;
      case "Video Games":
        tempData = [
          "Minecraft",
          "Grand Theft Auto V",
          "Tetris",
          "Wii Sports",
          "PUBG",
          "Mario Kart",
          "Super Mario Bros.",
          "Red Dead Redemption 2",
        ];
        answerData = [
          "minecraft",
          "gta 5",
          "tetris",
          "wii sports",
          "pubg",
          "mario kart",
          "super mario bros",
          "red dead redemption 2",
        ];
        break;
      case "Top Scorers 22/23":
        tempData = [
          "Erling Haaland",
          "Harry Kane",
          "Victor Osimhen",
          "Kylian Mbappe",
          "Ivan Toney",
          "Robert Lewandowski",
          "Marcus Rashford",
          "Lautaro Martinez",
        ];
        answerData = [
          "haaland",
          "kane",
          "osimhen",
          "mbappe",
          "toney",
          "lewandowski",
          "rashford",
          "lautaro",
        ];
        break;
      default:
        break;
    }
    console.log(tempData);
    console.log(answerData);
    if (answerData.length > 0) {
      setNonMusicData(answerData);
    } else {
      setNonMusicData(tempData.map((data) => data.toLowerCase()));
    }
    setAnswers(
      tempData.map((data) => {
        if (data.length > 19) return data.slice(0, 17) + "...";
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
      case "Album's Top Songs":
        compArray = [...albumGameData];
        break;
      case "Dog Breeds":
      case "Fast Food":
      case "Disney Channel Shows":
      case "Pixar Films":
      case "Cartoon Network Shows":
      case "Nickelodeon Shows":
      case "Top Scorers 22/23":
      case "Video Games":
      case "Receiving Yards All Time":
      case "Receiving Yards 22/23":
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
    window.scrollTo({
      behavior: "smooth",
      top:
        document.getElementById("gameBoardMobile").getBoundingClientRect().top -
        document.body.getBoundingClientRect().top -
        80,
    });
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
      case "Album's Top Songs":
        compArray = [...albumGameData];
        break;
      case "Dog Breeds":
      case "Fast Food":
      case "Disney Channel Shows":
      case "Pixar Films":
      case "Cartoon Network Shows":
      case "Nickelodeon Shows":
      case "Top Scorers 22/23":
      case "Video Games":
      case "Receiving Yards All Time":
      case "Receiving Yards 22/23":
        compArray = [...nonMusicData];
        break;
      default:
        break;
    }
    console.log(compArray);
    console.log(answers);
    let guessTrimmed = guessText.trim().replace(/[\u2018\u2019]/g, "'");
    if (!answered.includes(guessTrimmed.toLowerCase())) setGuessText("");
    if (compArray.includes(guessTrimmed.toLowerCase())) {
      if (!answered.includes(guessTrimmed.toLowerCase())) {
        if (!mute) playRight();
        for (let i = 0; i < compArray.length; i++) {
          if (compArray[i] === guessTrimmed.toLowerCase()) {
            document.getElementById(`listItem${i + 1}Mobile`).style.display =
              "none";
            document.getElementById(`correct${i + 1}Mobile`).style.display =
              "block";
            let tempAnswered = [...answered];
            tempAnswered.push(guessTrimmed.toLowerCase());
            if (tempAnswered.length === compArray.length) displayWin();
            setAnswered(tempAnswered);
          }
        }
      }
    } else {
      if (guessTrimmed.length > 0 && !noFailMode) {
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
          tempX += "X";
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
        } else if (xs.length === 2) {
          let tempX = xs;
          tempX += "X";
          setXs(tempX);
          if (!mute) playWrong();
          document.getElementById("xsMobile").style.display = "block";
          document.getElementById("guessInputMobile").disabled = true;
          setTimeout(() => {
            document.getElementById("xsMobile").style.display = "none";
            revealRest(compArray);
          }, 1500);
        }
      }
    }
  }

  function revealRest(arr) {
    let delay = 0;
    let count = answered.length;
    for (let i = arr.length - 1; i >= 0; i--) {
      if (!answered.includes(arr[i])) {
        count++;
        console.log(count);
        console.log(arr.length);
        setTimeout(() => {
          playRight();
          document.getElementById(`listItem${i + 1}Mobile`).style.display =
            "none";
          document.getElementById(`correct${i + 1}Mobile`).style.display =
            "block";
        }, 1000 + delay);
        if (count === arr.length)
          setTimeout(() => {
            playWin();
          }, 1200 + delay);
        delay += 2000;
      }
    }
  }

  function displayWin() {
    console.log("Win");
    playWin();
    document.getElementById("guessInputMobile").disabled = true;
  }

  return (
    <>
      <head>
        <meta
          name="viewport"
          content="width=device-width; initial-scale=1.0; maximum-scale=1.0;"
        />
      </head>
      <div className="App">
        <header className="App-header">
          <img alt="" className="blueLogo" id="blueLogo" src={blueLogo} />
          <img
            alt=""
            className="textLogoMobile"
            id="textLogoMobile"
            src={textLogo}
          ></img>
          {!token ? (
            <>
              <button
                className="loginButton"
                id="loginButton"
                onClick={authorize}
              >
                Log In with Spotify
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
                className="noFailIcon"
                onClick={() => {
                  setNoFailMode(!noFailMode);
                  if (noFailIcon === faToggleOff) setNoFailIcon(faToggleOn);
                  else setNoFailIcon(faToggleOff);
                }}
                style={{cursor: "pointer"}}
              >
                <FontAwesomeIcon
                  style={{display: "inline-block", marginLeft: "20px"}}
                  className="noFail"
                  id="xIcon"
                  size="xl"
                  color="white"
                  icon={noFailIcon}
                />
                <h4 style={{display: "inline-block", marginLeft: "10px"}}>
                  {noFailMode ? "No Fail Mode ON" : "No Fail Mode OFF"}
                </h4>
              </a>
              <img
                alt=""
                style={{marginTop: "50px"}}
                className="textLogo"
                src={textLogo}
              ></img>
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
                <button
                  onClick={() => {
                    setGameOption("Nickelodeon Shows");
                    assignNonMusic("Nickelodeon Shows");
                    displayGameBoard();
                  }}
                >
                  Nickelodeon Shows
                </button>
                <button
                  onClick={() => {
                    setGameOption("Top Scorers 22/23");
                    assignNonMusic("Top Scorers 22/23");
                    displayGameBoard();
                  }}
                >
                  Top Scorers 22/23
                </button>
                <button
                  onClick={() => {
                    setGameOption("Receiving Yards 22/23");
                    assignNonMusic("Receiving Yards 22/23");
                    displayGameBoard();
                  }}
                >
                  Receiving Yards 22/23
                </button>
                <button
                  onClick={() => {
                    setGameOption("Receiving Yards All Time");
                    assignNonMusic("Receiving Yards All Time");
                    displayGameBoard();
                  }}
                >
                  Receiving Yards All Time
                </button>
                <button
                  onClick={() => {
                    setGameOption("Video Games");
                    assignNonMusic("Video Games");
                    displayGameBoard();
                  }}
                >
                  Video Games
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
                    document.getElementById("gameOptionsMobile").style.display =
                      "none";
                    document.getElementById(
                      "artistSearchMobile"
                    ).style.display = "block";
                    document
                      .getElementById("searchInputMobile")
                      .addEventListener("keypress", function (event) {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          document.getElementById("searchButtonMobile").click();
                        }
                      });
                    setGameOption("Artists Top Tracks");
                  }}
                >
                  Artist's Top Tracks
                </button>
                <button
                  onClick={() => {
                    document.getElementById("gameOptionsMobile").style.display =
                      "none";
                    document.getElementById(
                      "artistSearchMobile"
                    ).style.display = "block";
                    document
                      .getElementById("searchInputMobile")
                      .addEventListener("keypress", function (event) {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          document.getElementById("searchButtonMobile").click();
                        }
                      });
                    setGameOption("Related");
                  }}
                >
                  Related Artists
                </button>
                <button
                  onClick={() => {
                    document.getElementById("gameOptionsMobile").style.display =
                      "none";
                    document.getElementById(
                      "artistSearchMobile"
                    ).style.display = "block";
                    document
                      .getElementById("searchInputMobile")
                      .addEventListener("keypress", function (event) {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          document.getElementById("searchButtonMobile").click();
                        }
                      });
                    setGameOption("Album's Top Songs");
                  }}
                >
                  Album's Top Songs
                </button>
              </div>
              <div
                className="artistSearchMobile"
                id="artistSearchMobile"
                style={{display: "none"}}
              >
                <h2 style={{fontSize: "20px"}}>
                  {albumMode ? "Choose an Album" : "Artist Search"}
                </h2>
                <input
                  autoComplete="off"
                  onChange={(e) => {
                    setSearchKey(e.target.value);
                  }}
                  style={{marginTop: "30px"}}
                  type="text"
                  className="searchInputMobile"
                  id="searchInputMobile"
                  value={searchKey}
                ></input>
                <button
                  id="searchButtonMobile"
                  className="guessButtonMobile"
                  onClick={logArtistData}
                >
                  Search
                </button>
                <div>
                  {artistData.map((artist, index) => {
                    return (
                      <>
                        <a
                          class="active"
                          style={{cursor: "pointer"}}
                          onClick={() => {
                            setSelectedArtist(artist.name);
                            if (gameOption === "Artists Top Tracks")
                              logArtistTopTracks(artist);
                            if (gameOption === "Related") logRelated(artist);
                            if (gameOption === "Album's Top Songs") {
                              if (albumMode) {
                                logAlbumTopTracks(artist);
                              } else logArtistAlbums(artist);
                            }
                          }}
                        >
                          <div
                            className="artistBlockMobile"
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
                              {artist.name.length > 14
                                ? artist.name.slice(0, 13) + "..."
                                : artist.name}
                            </h4>
                          </div>
                        </a>
                      </>
                    );
                  })}
                </div>
              </div>
              <div id="gameBoardMobile" className="gameBoardMobile">
                <h2 style={{fontSize: "27px"}}>
                  {selectedAlbum
                    ? selectedAlbum.name + "'s Top Tracks"
                    : gameTitle
                    ? gameTitle
                    : gameOption}
                </h2>
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
                      <div
                        id="listItem1Mobile"
                        className="listItem1Mobile"
                      ></div>
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
                    className="guessInputMobile"
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
    </>
  );
}

export default MobileApp;
