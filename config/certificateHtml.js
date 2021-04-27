exports.generateParticipantTemplate = (name, teamName) => {
  return `
  <!DOCTYPE html>
<html>
  <head>
    <link
      href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
      rel="stylesheet"
    />
    <style>
      body {
        margin: 0;
      }
      #container {
        width: 1440px;
        height: 900px;
        margin: 0;
        padding: 0;
        background: url("https://devsoc-web.s3.ap-south-1.amazonaws.com/wave.png"),
          #151515;
        background-repeat: no-repeat;
        font-family: "Montserrat", sans-serif;
        position: absolute;
      }
      #container div {
        position: absolute;
        font-family: Montserrat;
        font-style: normal;
        color: #ffffff;
        text-transform: uppercase;
      }
    </style>
  </head>

  <body>
    <div id="container">
      <div
        style="
          width: 573px;
          height: 140px;
          top: 50px;
          left: 66px;
          font-weight: bold;
          font-size: 56.6819px;
          line-height: 69px;
        "
      >
        CERTIFICATE OF PARTICIPATION
      </div>
      <img
        src="https://devsoc-web.s3.ap-south-1.amazonaws.com/devsoc.png"
        alt="Devsoc"
        style="
          position: absolute;
          top: 39.1px;
          right: 89.66px;
          width: 233.27px;
          height: 101px;
        "
      />
      <img
        src="https://devsoc-web.s3.ap-south-1.amazonaws.com/juspay.png"
        alt="Juspay"
        style="
          position: absolute;
          width: 51.02px;
          height: 51.02px;
          top: 709.12px;
          right: 91.03px;
        "
      />
      <img
        src="https://devsoc-web.s3.ap-south-1.amazonaws.com/rarible.png"
        alt="Rarible"
        style="
          position: absolute;
          width: 51.02px;
          height: 51.02px;
          top: 783.12px;
          right: 91.03px;
        "
      />
      <div
        style="
          width: 589px;
          height: 35px;
          top: 367px;
          left: 293px;
          font-weight: 500;
          font-size: 24px;
          line-height: 29px;
          color: #ffffff;
        "
      >
        THIS CERTIFICATE GOES TO
      </div>
      <div
        style="
          width: 1030px;
          height: 92px;
          top: 402px;
          left: 293px;
          font-weight: 600;
          font-size: 72px;
          line-height: 88px;
          background: linear-gradient(270deg, #1034fa 0%, #16d6ff 100%);
          background: -webkit-linear-gradient(270deg, #1034fa 0%, #16d6ff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        "
      >
        ${name}
      </div>
      <div
        style="
          width: 589px;
          height: 35px;
          top: 494px;
          left: 293px;
          font-weight: 500;
          font-size: 24px;
          line-height: 29px;
          color: #ffffff;
        "
      >
        OF TEAM
        <span
          style="
            background: linear-gradient(270deg, #1034fa 0%, #16d6ff 100%);
            background: -webkit-linear-gradient(
              270deg,
              #1034fa 0%,
              #16d6ff 100%
            );
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
          "
          >${teamName}</span
        >
      </div>
      <div
        style="
          width: 951px;
          height: 67px;
          top: 583px;
          left: 293px;
          font-weight: 600;
          font-size: 30px;
          line-height: 141.9%;
          color: #ffffff;
        "
      >
        FOR SUCCESSFULLY PARTICIPATING IN
        <span
          style="
            background: linear-gradient(270deg, #1034fa 0%, #16d6ff 100%);
            background: -webkit-linear-gradient(
              270deg,
              #1034fa 0%,
              #16d6ff 100%
            );
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
          "
          >DEVSOC’21</span
        >
        CONDUCTED BY CODECHEF-VIT
      </div>
      <div
        style="
          width: 222px;
          height: 35px;
          font-weight: 600;
          font-size: 30px;
          line-height: 37px;
          top: 734px;
          left: 293px;
        "
      >
        KUNAL SINGH
      </div>
      <div
        style="
          width: 85px;
          height: 28px;
          font-weight: 500;
          font-size: 24px;
          line-height: 29px;
          top: 776px;
          left: 293px;
        "
      >
        CHAIR
      </div>
      <div
        style="
          width: 194px;
          height: 28px;
          font-weight: 500;
          font-size: 24px;
          line-height: 29px;
          top: 811px;
          left: 293px;
        "
      >
        CODECHEF-VIT
      </div>
      <img
        src="https://devsoc-web.s3.ap-south-1.amazonaws.com/cc-logo.png"
        alt="CODECHEF-VIT"
        style="
          position: absolute;
          width: 115px;
          height: 115px;
          top: 731px;
          left: 530px;
        "
      />
    </div>
  </body>
</html>

  `
}

exports.generateWinnerTemplate = () => {
  return ``
}