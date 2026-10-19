/*
  acu-interactives.js
  Stand-in for ACUShortCourse_Theme.js (the Canvas theme script), for the static taster site.
  It rebuilds interactives into the same markup the Short Courses theme CSS expects.

  Tabs: <div class="acu_tab"> with alternating child divs, heading then panel:
    <div class="acu_tab">
      <div>Tab 1 label</div> <div>Tab 1 content</div>
      <div>Tab 2 label</div> <div>Tab 2 content</div>
    </div>
  becomes .tab_controls (holding .tab_heading > h3) plus .tab_container (holding .tab_panel),
  the same structure Canvas produces. It also adds ARIA tab roles and arrow-key navigation.

  Supported so far: acu_tab, acu_click-reveal, acu_accordion.
*/
(function () {
  "use strict";

  function initTabs() {
    var tabSets = document.querySelectorAll(".user_content .acu_tab:not(.postSetup)");

    Array.prototype.forEach.call(tabSets, function (tabSet, setIndex) {
      var setId = "acu_tabs-instance-" + setIndex;
      var children = Array.prototype.slice.call(tabSet.children);

      var controls = document.createElement("div");
      controls.className = "tab_controls";
      controls.setAttribute("role", "tablist");

      var container = document.createElement("div");
      container.className = "tab_container";

      var headings = [];
      var panels = [];

      for (var i = 0; i + 1 < children.length; i += 2) {
        var n = i / 2;
        var heading = children[i];
        var panel = children[i + 1];

        heading.id = setId + "-button-" + n;
        heading.className = (heading.className + " tab_heading").trim();
        heading.innerHTML = "<h3>" + heading.innerHTML.trim() + "</h3>";
        heading.setAttribute("role", "tab");
        heading.setAttribute("aria-controls", setId + "-panel-" + n);
        heading.setAttribute("aria-selected", "false");
        heading.setAttribute("tabindex", "-1");

        panel.id = setId + "-panel-" + n;
        panel.className = (panel.className + " tab_panel").trim();
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("aria-labelledby", heading.id);
        panel.style.display = "none";

        controls.appendChild(heading);
        container.appendChild(panel);
        headings.push(heading);
        panels.push(panel);
      }

      function show(index, focus) {
        headings.forEach(function (h, j) {
          var on = j === index;
          h.classList.toggle("active", on);
          h.setAttribute("aria-selected", on ? "true" : "false");
          h.setAttribute("tabindex", on ? "0" : "-1");
          panels[j].style.display = on ? "block" : "none";
        });
        if (focus) headings[index].focus();
      }

      headings.forEach(function (h, j) {
        h.addEventListener("click", function () { show(j, false); });
        h.addEventListener("keydown", function (e) {
          var last = headings.length - 1;
          var target = null;
          if (e.key === "ArrowRight") target = j === last ? 0 : j + 1;
          else if (e.key === "ArrowLeft") target = j === 0 ? last : j - 1;
          else if (e.key === "Home") target = 0;
          else if (e.key === "End") target = last;
          else if (e.key === "Enter" || e.key === " ") target = j;
          if (target !== null) {
            e.preventDefault();
            show(target, true);
          }
        });
      });

      tabSet.id = setId;
      tabSet.classList.add("acu_cbi");
      tabSet.appendChild(controls);
      tabSet.appendChild(container);
      tabSet.classList.add("postSetup");

      if (headings.length) show(0, false);
    });
  }

  /*
    Click and reveal: <div class="acu_click-reveal"> with child divs in pairs, heading then panel:
      <div class="acu_click-reveal">
        <div>Button label</div> <div>Hidden content</div>
      </div>
    The heading becomes .clr_heading > h3 + .chevron, and the panel becomes .clr_panel.
  */
  function initClickReveals() {
    var reveals = document.querySelectorAll(".user_content .acu_click-reveal:not(.postSetup)");

    Array.prototype.forEach.call(reveals, function (reveal, setIndex) {
      var setId = "acu_click-reveal-instance-" + setIndex;
      var children = Array.prototype.slice.call(reveal.children);

      reveal.id = setId;
      reveal.classList.add("acu_cbi");

      for (var i = 0; i + 1 < children.length; i += 2) {
        (function (heading, panel, n) {
          heading.className = (heading.className + " clr_heading").trim();
          heading.innerHTML = "<h3>" + heading.innerHTML.trim() + "</h3>";
          var chevron = document.createElement("span");
          chevron.className = "chevron down";
          chevron.setAttribute("aria-hidden", "true");
          heading.appendChild(chevron);

          panel.className = (panel.className + " clr_panel").trim();
          panel.id = setId + "-panel-" + n;

          heading.setAttribute("role", "button");
          heading.setAttribute("tabindex", "0");
          heading.setAttribute("aria-expanded", "false");
          heading.setAttribute("aria-controls", panel.id);

          function toggle() {
            var opening = !heading.classList.contains("active");
            heading.classList.toggle("active", opening);
            heading.setAttribute("aria-expanded", opening ? "true" : "false");
            chevron.className = opening ? "chevron up" : "chevron down";
            if (opening) {
              panel.className = "clr_panel active slideDown";
              panel.style.maxHeight = panel.scrollHeight + 150 + "px";
            } else {
              panel.style.maxHeight = null;
              panel.className = "clr_panel slideUp";
            }
          }

          heading.addEventListener("click", toggle);
          heading.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggle();
            }
          });
        })(children[i], children[i + 1], i / 2);
      }

      reveal.classList.add("postSetup");
    });
  }

  /*
    Accordion: <div class="acu_accordion"> with children in pairs, heading then panel.
    As in Canvas, any element can be a panel (e.g. a bare <ul>), and several can be open at once.
  */
  function initAccordions() {
    var accordions = document.querySelectorAll(".user_content .acu_accordion:not(.postSetup)");

    Array.prototype.forEach.call(accordions, function (acc, setIndex) {
      var setId = "acu_accordion-instance-" + setIndex;
      var children = Array.prototype.slice.call(acc.children);

      acc.id = setId;
      acc.classList.add("acu_cbi");

      for (var i = 0; i + 1 < children.length; i += 2) {
        (function (heading, panel, n) {
          heading.className = (heading.className + " acc_heading").trim();
          heading.innerHTML = "<h3>" + heading.innerHTML.trim() + "</h3>";
          var chevron = document.createElement("span");
          chevron.className = "chevron up down";
          chevron.setAttribute("aria-hidden", "true");
          heading.appendChild(chevron);

          panel.className = (panel.className + " acc_panel").trim();
          panel.id = setId + "-panel-" + n;

          heading.setAttribute("role", "button");
          heading.setAttribute("tabindex", "0");
          heading.setAttribute("aria-expanded", "false");
          heading.setAttribute("aria-controls", panel.id);

          function toggle() {
            var opening = !heading.classList.contains("active");
            heading.classList.toggle("active", opening);
            heading.setAttribute("aria-expanded", opening ? "true" : "false");
            if (opening) {
              chevron.className = "chevron up";
              panel.className = "acc_panel active slideDown";
              panel.style.maxHeight = panel.scrollHeight + 150 + "px";
            } else {
              chevron.className = "chevron up down";
              panel.style.maxHeight = null;
              panel.className = "acc_panel slideUp";
            }
          }

          heading.addEventListener("click", toggle);
          heading.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggle();
            }
          });
        })(children[i], children[i + 1], i / 2);
      }

      acc.classList.add("postSetup");
    });
  }

  function init() {
    initTabs();
    initClickReveals();
    initAccordions();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
