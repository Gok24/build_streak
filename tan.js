const compliments = [
    "Amazing!", "Bravo!", "Fantastic!", "Superb!", "Awesome!",
    "Brilliant!", "Nice!", "Perfect!", "Excellent!", "Wow!",
    "Great!", "Boom!", "Done!", "Sweet!", "Nailed it!",
    "Success!", "Yesss!", "Victory!", "Clean!", "Smooth!",
    "Well done!", "Great job!", "You did it!", "That’s it!", "Task complete!",
    "Nicely done!", "Mission accomplished!", "Crushed it!", "You rock!", "Way to go!",
    "All done!", "You got it!", "That was fast!", "Super smooth!", "Good work!",
    "Clean finish!", "Just perfect!", "On point!", "Flawless!"
  ];
  
  const message = compliments[Math.floor(Math.random() * compliments.length)];
  
  const container = document.getElementById("tan");
  
  message.split("").forEach((char, i) => {
    const span = document.createElement("span");
    span.textContent = (char === " ") ? "\u00A0" : char;  // Non-breaking space
    span.classList.add("char");
    container.appendChild(span);
  
    setTimeout(() => {
      span.classList.add("visible");
    }, 1500 + i * 70);
  });
  