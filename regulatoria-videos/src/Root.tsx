import { Composition } from "remotion";
import { RegulatoriaVideo } from "./RegulatoriaVideo";

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
    </>
  );
};
