module.exports = {
  host: "qtdevrelations",
  cert: "./client.pem", //"C:/ProgramData/Qlik/Sense/Repository/Exported Certificates/.Local Certificates/client.pem" <- Use this later
  qrs: {
    host: "10.211.55.3",
    app: this.host === "qtdevrelations" ? "bf6c1ed8-69fb-4378-86c2-a1c71a2b3cc1" : "NICK UPDATE WITH APP ID FROM BRANCH-TEST"
  },
  mongoconnectionstring: "mongodb://branch-test.qlik.com:27017/branch"
}
