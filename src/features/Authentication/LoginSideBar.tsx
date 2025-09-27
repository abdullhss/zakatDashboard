import { StyledSideBar, SideBackground } from "./Styles/LoginpageStyles";

const sideImageSrc = "/assets/FrameDesign.png";

export default function LoginSideBar() {
  return (
    <StyledSideBar>
      <SideBackground bgImage={`url(${sideImageSrc})`} />
    </StyledSideBar>
  );
}
