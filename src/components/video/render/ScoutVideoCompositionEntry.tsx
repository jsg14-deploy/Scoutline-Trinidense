import { registerRoot, Composition } from "remotion";
import { ScoutVideoComposition } from "./ScoutVideoComposition";

registerRoot(() => (
  <>
    <Composition
      id="scout-video-horizontal"
      component={ScoutVideoComposition}
      durationInFrames={9000} // duración máxima, se ajusta con inputProps en renderMedia
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        playerName: "Nombre Jugador",
        position: "Extremo",
        team: "Sportivo Trinidense",
        photoUrl: "",
        statistics: [],
        strengths: [],
        weaknesses: [],
        clips: [],
        aspectRatio: "16:9",
      }}
    />
    <Composition
      id="scout-video-vertical"
      component={ScoutVideoComposition}
      durationInFrames={9000}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{
        playerName: "Nombre Jugador",
        position: "Extremo",
        team: "Sportivo Trinidense",
        photoUrl: "",
        statistics: [],
        strengths: [],
        weaknesses: [],
        clips: [],
        aspectRatio: "9:16",
      }}
    />
  </>
));
