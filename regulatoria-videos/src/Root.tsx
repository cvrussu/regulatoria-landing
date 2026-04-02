import { Composition } from "remotion";
import { RegulatoriaVideo } from "./RegulatoriaVideo";
import { LogoAnimation } from "./LogoAnimation";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="RegulatoriaVideo"
        component={RegulatoriaVideo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: "RegulatorIA",
          subtitle: "Primera Consultora de Registro de Agroquímicos con IA",
        }}
      />
      <Composition
        id="LogoAnimation"
        component={LogoAnimation}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
