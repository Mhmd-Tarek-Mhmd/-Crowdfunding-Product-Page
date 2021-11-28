const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

/*
 ** Page Logic
 */
(function () {
  const Model = {
    currentPlan: null,
    plans: [
      {
        title: "Bamboo Stand",
        price: 25,
        left: 101,
      },
      {
        title: "Black Edition Stand",
        price: 75,
        left: 64,
      },
      {
        title: "Mahogany Special Edition",
        price: 200,
        left: 0,
      },
    ],
  };

  const Controller = {
    getCurrentPlan: () => Model.currentPlan,
    setCurrentPlan: (plan) => (Model.currentPlan = plan),

    planLeft: function () {
      this.getCurrentPlan().left - 1;
    },

    purchase: function (plan) {
      this.setCurrentPlan(plan);
      this.planLeft();
      Views.render();
    },

    init: function () {
      Views.init();
    },
  };

  const Views = {
    init: function () {
      // Helper Function
      function setPlan(target) {
        $$("#modal-default .box").forEach((box) =>
          box.classList.remove("selected")
        );
        Controller.setCurrentPlan(target);
        $(`#modal-default .${target}`).classList.add("selected");
        $(`.${target} input[type=radio]`).checked = "checked";
      }

      /*
       ** Main Boxes
       */
      $$("#main-boxes .box").forEach((element) => {
        element.addEventListener("click", (e) => {
          if (e.target.tagName.toLowerCase() === "button") {
            const plan = e.target.parentElement.parentElement.classList[1];

            setPlan(plan);
            Helpers.showModal("#modal-default");
            $(`#modal-default .${plan}`).scrollIntoView();
          }
        });
      });

      /*
       ** Modal Default Boxes
       */

      $$("#modal-default .box").forEach((box) => {
        // [1] Set current plan
        box.addEventListener("focus", (e) => setPlan(e.target.classList[1]));

        // [2] Submit a Purchase
        box.addEventListener("click", (e) => {
          if (
            e.target.tagName.toLowerCase() === "input" &&
            e.target.type.toLowerCase() === "submit"
          ) {
            e.preventDefault();
            Controller.purchase(Controller.getCurrentPlan());
            Helpers.hideModal("#modal-default");
            Helpers.showModal("#modal-completed");
          }
        });
      });

      /*
       ** Back To Main Page
       */
      $("#modal-completed button").onclick = () =>
        Helpers.hideModal("#modal-completed");

      $("#modal-default .close-modal").onclick = () =>
        Helpers.hideModal("#modal-default");

      $(".modals").onkeyup = (e) => {
        if (e.keyCode == 27) {
          Helpers.hideModal("#modal-default");
          Helpers.hideModal("#modal-completed");
        } else {
          return;
        }
      };

      /*
       ** Bookmark Button
       */
      $(".header .bookmark").onclick = (e) => {
        e.target.classList.toggle("bookmarked");
        $(".header .bookmark #label").textContent = e.target.classList.contains(
          "bookmarked"
        )
          ? "Bookmarked"
          : "Bookmark";
      };

      /*
       ** Nav area
       */
      $("nav button").onclick = function () {
        const img = $("nav button img");
        const imgSrc = [
          "images/icon-hamburger.svg",
          "images/icon-close-menu.svg",
        ];

        $("body").classList.toggle("has-modal");
        $("nav .mobile-links").classList.toggle("mobile-hide");
        img.src = img.src.includes(imgSrc[0]) ? imgSrc[1] : imgSrc[0];

        $("nav").classList.toggle("has-modal");
        if ($("nav.has-modal") !== null) {
          Helpers.trapFocus($("nav.has-modal"));

          $("nav.has-modal").onkeyup = (e) => {
            if (e.keyCode == 27) {
              $("body").classList.remove("has-modal");
              $("nav .mobile-links").classList.add("mobile-hide");
              img.src = imgSrc[0];
            } else {
              return;
            }
          };
        }
      };
    },

    render: function () {
      const plan = Controller.getCurrentPlan();

      /*
       ** Total backers
       */
      const totalBackers = $(".stats .total-backers");
      let totalBackersVal = parseFloat(
        totalBackers.textContent.replace(",", "")
      );

      totalBackersVal++;
      totalBackers.textContent = (totalBackersVal / 1000)
        .toFixed(3)
        .replace(".", ",");

      if (plan != "no-reward") {
        /*
         ** Left plan
         */
        const leftPlans = $$(`.${plan} .left`);
        leftPlans.forEach((leftPlan) => {
          let left = parseInt(leftPlan.firstElementChild.textContent);
          left--;
          leftPlan.firstElementChild.textContent = left;

          left === 0 &&
            $$(`.${plan}`).forEach((ele) => ele.classList.add("out-of-stock"));
        });

        /*
         ** Total backed
         */
        const totalBacked = $(".stats .backed span");
        const currency = Intl.NumberFormat("en-Us");
        const addVal = $(`#modal-default .${plan} input[type=number]`).value;
        let totalBackedVal = parseFloat(
          totalBacked.textContent.replace(",", "")
        );

        totalBackedVal = totalBackedVal + parseInt(addVal);
        totalBacked.textContent = currency.format(totalBackedVal);

        /*
         ** Progress bar
         */
        const progressBar = $(".stats .progress-bar span");
        progressBar.style.width = `${totalBackedVal / 1000}%`;
      }
    },
  };

  const Helpers = {
    show: function (target) {
      $(target).classList.remove("hide");
    },
    hide: function (target) {
      $(target).classList.add("hide");
    },

    showModal: function (target) {
      $("body").classList.add("has-modal");
      this.show(target);
      $(target).firstElementChild.focus();
      $(target).firstElementChild.ariaHidden = false;
      this.trapFocus($(target).firstElementChild);
    },
    hideModal: function (target) {
      $("body").classList.remove("has-modal");
      this.hide(target);
      $(target).firstElementChild.blur();
      $(target).firstElementChild.ariaHidden = true;
    },

    trapFocus: function (element) {
      const focusableEls = element.querySelectorAll(
        'a[href]:not([disabled]), input:not([disabled]), button:not([disabled]), *[tabindex="0"]'
      );
      const firstFocusableEl = focusableEls[0];
      const lastFocusableEl = focusableEls[focusableEls.length - 1];

      element.addEventListener("keydown", function (e) {
        const isTabPressed = e.key === "Tab" || e.keyCode === 9;

        if (!isTabPressed) {
          return;
        }

        if (e.shiftKey) {
          /* shift + tab */
          if (document.activeElement === firstFocusableEl) {
            lastFocusableEl.focus();
            e.preventDefault();
          }
        } else {
          /* tab */
          if (document.activeElement === lastFocusableEl) {
            firstFocusableEl.focus();
            e.preventDefault();
          }
        }
      });
    },
  };

  Controller.init();
})();
