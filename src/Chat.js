const { startup, stopStreaming } = require("./capture");
const timer = require("./timer");

class Chat {
  constructor() {
    this.socket = io.connect();
    this.init();
  }
  init() {
    const mainPage = document.getElementById("mainPage");
    const landingPage = document.getElementById("landingPage");
    const overlayBtn = document.getElementById("overlayBtn");
    const info = document.getElementById("info");
    const notification = document.getElementById("notification");
    const messageInput = document.getElementById("inputText");
    const nextBtn = document.getElementById("next");
    const exitBtn = document.getElementById("exit");
    const navbar = document.getElementById("simpleNavbar");
    const modal = document.getElementById("modal");
    const cameraBtn = document.getElementById("cameraBtn");
    const modalBis = document.getElementById("modal-bis");
    const modalBisCloseBtn = document.getElementById("modal-bis-close-btn");
    const displayedPic = document.getElementById("photo");
    const timerHTML = document.getElementById("timer");
    let countdown;
    let that = this;
    let firstTime = true;

    this.socket.on("connect", () => {
      document.getElementById("name").focus();
      // navbar.style.display = "none";
      if (!firstTime) {
        if (this.socket.connected) {
          this.socket.emit("previous id", {
            id: localStorage.getItem("socketId"),
            nickname: localStorage.getItem("nickname"),
          });
        }
      } else {
        localStorage.removeItem("socketId");
        localStorage.removeItem("nickname");
      }
    });

    this.socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        // the disconnection was initiated by the server, you need to reconnect manually
        this.socket.connect();
      } else {
        // else the socket will automatically try to reconnect
      }
      console.log("socket disconnected");
    });

    this.socket.on("reconnect", () => {
      console.log("reconnected.");
      notification.style.display = "none";
      notification.classList.remove("is-danger");
      const div = document.querySelector("#notification div");
      div.textContent = "";
    });

    this.socket.on("reconnecting", () => {
      displayNotification("Reconnecting...", "info");
      console.log("Reconnecting... to server");
    });

    this.socket.once("connect_error", function () {
      // pause your timer
      console.log("connect error");
      displayNotification("No internet connection.", "danger");
    });

    this.socket.on("loginSuccess", () => {
      if (info.style.display == "block") {
        info.style.display = "none";
      }
      overlayBtn.classList.add("is-loading");
      modal.classList.add("is-active");
    });

    this.socket.on("gotAPair", (user, otherUser) => {
      notification.style.display = "none";
      [modal, overlayBtn].forEach((e) => {
        e.classList.remove("is-active");
      });
      mainPage.style.display = "block";
      navbar.style.display = "flex";
      landingPage.style.display = "none";
      const mainUser = document.getElementById("subtitle");
      mainUser.textContent = user;
      document.getElementById("otherUser").textContent = otherUser;
      messageInput.disabled = false;
      clearInterval(countdown);
      document.getElementById("timer").textContent = "";
      // register your timer here;
      countdown = timer(function () {
        that.socket.emit("timer expired");
      }).ref;
      localStorage.setItem("socketId", this.socket.id);
      localStorage.setItem("nickname", user);
    });

    this.socket.on("partnerLeft", (msg) => {
      clearTimer();
      // clear your timer
      displayMessageOnLogin(msg);
    });

    this.socket.on("notification", (msg, code) => {
      clearTimer();
      displayNotification(msg, code);
    });

    this.socket.on("system", function (userCount) {
      document.getElementById("onlineCount").textContent = `User Online: ${userCount}`;
    });

    this.socket.on("newMsg", function (user, msg) {
      that._displayNewMsg(user, msg, "left");
    });

    nextBtn.addEventListener("click", () => {
      document.getElementById("modal-quar").classList.remove("is-active");
      that.socket.emit("findAnotherPair");
      modal.classList.add("is-active");
      // clear your timer
      clearTimer();
      that._removeChild(document.querySelector("#msgContainer .columns .column"));
    });

    exitBtn.addEventListener("click", () => {
      document.getElementById("modal-tris").classList.remove("is-active");
      // clear your timer
      that.socket.emit("getMeOut");
    });

    document.getElementById("overlayBtn").addEventListener(
      "click",
      () => {
        var nickName = document.getElementById("name").value;
        if (nickName.trim().length != 0) {
          that.socket.emit("login", nickName);
        } else {
          document.getElementById("name").focus();
        }
      },
      false
    );

    document.getElementById("close_btn").addEventListener("click", () => {
      notification.style.display = "none";
    });
    document.getElementById("name").addEventListener("keyup", loginHandler, false);
    document.getElementById("btnSend").addEventListener("click", sendMessageHander, false);
    messageInput.addEventListener("keyup", sendMessageHander, false);
    messageInput.addEventListener("input", () => {
      that.socket.emit("postMsg", { msg: "", typing: true });
    });
    cameraBtn.addEventListener("click", () => {
      // modalBis.classList.add("is-active");
      alert("not implemented yet");
      startup();
    });
    modalBisCloseBtn.addEventListener("click", () => {
      modalBis.classList.remove("is-active");
      displayedPic.setAttribute("src", "");
      stopStreaming();
    });
    document.getElementById("imageBtn").addEventListener(
      "click",
      () => {
        if (displayedPic.src !== "") {
          that.socket.emit("postMsg", { msg: "", img: displayedPic.src, typing: false });
          that._displayNewMsg("me", { msg: "", img: displayedPic.src, typing: false });
          modalBisCloseBtn.click();
        }
      },
      false
    );

    function clearTimer() {
      clearInterval(countdown);
      timerHTML.textContent = "";
    }

    function displayNotification(msg, type) {
      if (type === "danger") {
        messageInput.disabled = true;
        notification.classList.add("is-danger");
      }
      const div = document.querySelector("#notification div");
      div.textContent = msg;
      notification.style.display = "block";
    }
    function loginHandler(e) {
      if (isNaN(Number(e.keyCode)) || e.keyCode === 13) {
        var nickName = document.getElementById("name").value;
        if (nickName.trim().length != 0) {
          that.socket.emit("login", nickName);
        }
      }
    }

    function sendMessageHander(e) {
      var msg = messageInput.value;
      if (msg.trim().length != 0) {
        if (isNaN(Number(e.keyCode)) || e.keyCode === 13) {
          messageInput.value = "";
          that.socket.emit("postMsg", { msg, typing: false });
          that._displayNewMsg("me", { msg }, "right");
        }
      }
    }
    function displayMessageOnLogin(msg) {
      if (notification.style.display == "block") {
        notification.style.display = "none";
      }
      mainPage.style.display = "none";
      that._removeChild(document.querySelector("#msgContainer .columns .column"));
      landingPage.style.display = "block";
      navbar.style.display = "none";
      overlayBtn.classList.remove("is-loading");
      overlayBtn.textContent = "Start";
      if (info.style.display === "none") {
        const innerHTML = `<span class="span">${msg}</span>`;
        info.innerHTML = innerHTML;
        info.style.display = "block";
      }
    }
  }

  _removeChild(node) {
    [].slice.call(node.children).forEach((e) => {
      node.removeChild(e);
    });
  }

  _displayNewMsg(user, msg, direction) {
    const container = document.querySelector("#msgContainer .columns .column");
    let HTML = document.createElement("div");

    if (direction === "left") {
      ["field", "has-text-left"].forEach((e) => HTML.classList.add(e));
      let html;
      // const leftMsg = document.querySelectorAll(".left-aligned");
      // const leftLastChild = leftMsg[leftMsg.length - 1];
      if (msg.typing) {
        // if (leftMsg.length == 0 || leftLastChild.textContent !== `${user}: typing...`) {
        //   html = `<span class="span"><strong>${user}: </strong></span><span class="span">typing...</span>`;
        //   HTML.innerHTML = html;
        //   container.appendChild(HTML);
        // }
      } else {
        if ("img" in msg) {
          // it's an image
          const img = new Image();
          img.onload = function () {
            insertDOM(`<img src=${img.src}>`);
          };
          img.src = msg.img;
        } else {
          // if (leftMsg.length == 0 || leftLastChild.textContent === `${user}: typing...`) {
          //   // remove typing child
          //   container.removeChild(leftLastChild);
          //   html = `<span class="span"><strong>${user}: </strong></span><span class="span">${msg.msg}</span>`;
          // } else {
          //   html = `<span class="span"><strong>${user}: </strong></span><span class="span">${msg.msg}</span>`;
          // }
          // HTML.innerHTML = html;
          // container.appendChild(HTML);
          insertDOM(msg.msg);
        }
        container.appendChild(HTML);
      }
    } else {
      ["field", "has-text-right"].forEach((e) => HTML.classList.add(e));
      if ("img" in msg) {
        // it's an image
        const img = new Image();
        img.onload = function () {
          insertDOM(`<img src=${img.src}>`);
        };
        img.src = msg.img;
      } else {
        insertDOM(msg.msg);
      }
      container.appendChild(HTML);
    }

    function insertDOM(domString) {
      HTML.innerHTML = `<div class="control custom"><span class="msg has-background-white">${domString}</span></div>`;
    }
  }
}
module.exports = Chat;
