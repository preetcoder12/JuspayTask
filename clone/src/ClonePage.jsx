import React, { useState, useRef, useEffect, useCallback } from "react";
import { Play, Square, RotateCcw, Flag, Plus, Trash2 } from "lucide-react";

const ScratchClone = () => {
  const [selectedCategory, setSelectedCategory] = useState("Motion");
  const [workspaceBlocks, setWorkspaceBlocks] = useState([]);
  const [sprites, setSprites] = useState([
    {
      id: 1,
      name: "Sprite1",
      x: 0,
      y: 0,
      direction: 90,
      size: 100,
      visible: true,
    },
  ]);
  const [selectedSprite, setSelectedSprite] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showSpriteModal, setShowSpriteModal] = useState(false);
  const [newSpriteName, setNewSpriteName] = useState("");
  const canvasRef = useRef(null);
  const workspaceRef = useRef(null);
  const executionRef = useRef(null);

  const categories = [
    {
      name: "Motion",
      color: "bg-gradient-to-br from-indigo-500 to-indigo-600",
      icon: "🚀",
      blocks: [
        {
          type: "move",
          text: "move {steps} steps",
          inputs: [{ name: "steps", type: "number", value: 10 }],
          category: "Motion",
        },
        {
          type: "turn_right",
          text: "turn ↻ {degrees} degrees",
          inputs: [{ name: "degrees", type: "number", value: 15 }],
          category: "Motion",
        },
        {
          type: "turn_left",
          text: "turn ↺ {degrees} degrees",
          inputs: [{ name: "degrees", type: "number", value: 15 }],
          category: "Motion",
        },
        {
          type: "point_direction",
          text: "point in direction {direction}",
          inputs: [{ name: "direction", type: "number", value: 90 }],
          category: "Motion",
        },
        {
          type: "goto_xy",
          text: "go to x: {x} y: {y}",
          inputs: [
            { name: "x", type: "number", value: 0 },
            { name: "y", type: "number", value: 0 },
          ],
          category: "Motion",
        },
        {
          type: "change_x",
          text: "change x by {value}",
          inputs: [{ name: "value", type: "number", value: 10 }],
          category: "Motion",
        },
        {
          type: "change_y",
          text: "change y by {value}",
          inputs: [{ name: "value", type: "number", value: 10 }],
          category: "Motion",
        },
        {
          type: "set_x",
          text: "set x to {x}",
          inputs: [{ name: "x", type: "number", value: 0 }],
          category: "Motion",
        },
        {
          type: "set_y",
          text: "set y to {y}",
          inputs: [{ name: "y", type: "number", value: 0 }],
          category: "Motion",
        },
      ],
    },
    {
      name: "Looks",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      icon: "🎨",
      blocks: [
        {
          type: "say",
          text: "say {text} for {seconds} seconds",
          inputs: [
            { name: "text", type: "text", value: "Hello!" },
            { name: "seconds", type: "number", value: 2 },
          ],
          category: "Looks",
        },
        { type: "show", text: "show", category: "Looks" },
        { type: "hide", text: "hide", category: "Looks" },
        {
          type: "change_size",
          text: "change size by {change}",
          inputs: [{ name: "change", type: "number", value: 10 }],
          category: "Looks",
        },
        {
          type: "set_size",
          text: "set size to {size}%",
          inputs: [{ name: "size", type: "number", value: 100 }],
          category: "Looks",
        },
      ],
    },
    {
      name: "Sound",
      color: "bg-gradient-to-br from-pink-500 to-pink-600",
      icon: "🔊",
      blocks: [
        {
          type: "play_sound",
          text: "play sound {sound}",
          inputs: [{ name: "sound", type: "text", value: "meow" }],
          category: "Sound",
        },
      ],
    },
    {
      name: "Events",
      color: "bg-gradient-to-br from-amber-500 to-amber-600",
      icon: "⚡",
      blocks: [
        {
          type: "when_flag",
          text: "when 🏁 clicked",
          isHat: true,
          category: "Events",
        },
        {
          type: "when_key",
          text: "when {key} key pressed",
          isHat: true,
          inputs: [{ name: "key", type: "text", value: "space" }],
          category: "Events",
        },
      ],
    },
    {
      name: "Control",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      icon: "🎮",
      blocks: [
        {
          type: "wait",
          text: "wait {seconds} seconds",
          inputs: [{ name: "seconds", type: "number", value: 1 }],
          category: "Control",
        },
        {
          type: "repeat",
          text: "repeat {times}",
          inputs: [{ name: "times", type: "number", value: 10 }],
          isC: true,
          category: "Control",
        },
        { type: "forever", text: "forever", isC: true, category: "Control" },
      ],
    },
    {
      name: "Sensing",
      color: "bg-gradient-to-br from-cyan-500 to-cyan-600",
      icon: "👁️",
      blocks: [
        {
          type: "touching",
          text: "touching {sprite}?",
          inputs: [{ name: "sprite", type: "text", value: "edge" }],
          category: "Sensing",
        },
      ],
    },
    {
      name: "Operators",
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      icon: "🔢",
      blocks: [
        {
          type: "add",
          text: "{a} + {b}",
          inputs: [
            { name: "a", type: "number", value: 0 },
            { name: "b", type: "number", value: 0 },
          ],
          category: "Operators",
        },
      ],
    },
    {
      name: "Variables",
      color: "bg-gradient-to-br from-rose-500 to-rose-600",
      icon: "📊",
      blocks: [
        {
          type: "set_variable",
          text: "set {variable} to {value}",
          inputs: [
            { name: "variable", type: "text", value: "my variable" },
            { name: "value", type: "number", value: 0 },
          ],
          category: "Variables",
        },
      ],
    },
    {
      name: "My Blocks",
      color: "bg-gradient-to-br from-violet-500 to-violet-600",
      icon: "🧩",
      blocks: [],
    },
  ];

  const currentCategory = categories.find(
    (cat) => cat.name === selectedCategory
  );

  const handleDragStart = (e, block) => {
    e.dataTransfer.setData("application/json", JSON.stringify(block));
    e.dataTransfer.effectAllowed = "copy";
  };

  const snapToGrid = (value, gridSize = 40) => {
    return Math.round(value / gridSize) * gridSize;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    try {
      const blockData = JSON.parse(e.dataTransfer.getData("application/json"));
      const rect = workspaceRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newBlock = {
        ...JSON.parse(JSON.stringify(blockData)),
        id: Date.now() + Math.random(),
        isHat: blockData.isHat || false,
        isC: blockData.isC || false,
        x: snapToGrid(Math.max(0, x - 90)),
        y: snapToGrid(Math.max(0, y - 20)),
      };

      setWorkspaceBlocks((prev) => [...prev, newBlock]);
    } catch (err) {
      console.error("Drop error:", err);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const executeBlock = useCallback((block, spriteIndex) => {
    return new Promise((resolve) => {
      setSprites((prevSprites) => {
        const newSprites = [...prevSprites];
        const sprite = { ...newSprites[spriteIndex] };

        switch (block.type) {
          case "move":
            const steps = parseFloat(getInputValue(block, "steps")) || 10;
            const radians = ((sprite.direction - 90) * Math.PI) / 180;
            sprite.x += Math.cos(radians) * steps;
            sprite.y += Math.sin(radians) * steps;
            break;

          case "turn_right":
            const rightDegrees =
              parseFloat(getInputValue(block, "degrees")) || 15;
            sprite.direction = (sprite.direction + rightDegrees) % 360;
            break;

          case "turn_left":
            const leftDegrees =
              parseFloat(getInputValue(block, "degrees")) || 15;
            sprite.direction = (sprite.direction - leftDegrees + 360) % 360;
            break;

          case "point_direction":
            sprite.direction =
              parseFloat(getInputValue(block, "direction")) || 90;
            break;

          case "goto_xy":
            sprite.x = parseFloat(getInputValue(block, "x")) || 0;
            sprite.y = parseFloat(getInputValue(block, "y")) || 0;
            break;

          case "change_x":
            sprite.x += parseFloat(getInputValue(block, "value")) || 10;
            break;

          case "change_y":
            sprite.y += parseFloat(getInputValue(block, "value")) || 10;
            break;

          case "set_x":
            sprite.x = parseFloat(getInputValue(block, "x")) || 0;
            break;

          case "set_y":
            sprite.y = parseFloat(getInputValue(block, "y")) || 0;
            break;

          case "show":
            sprite.visible = true;
            break;

          case "hide":
            sprite.visible = false;
            break;

          case "change_size":
            const sizeChange = parseFloat(getInputValue(block, "change")) || 10;
            sprite.size = Math.max(10, Math.min(300, sprite.size + sizeChange));
            break;

          case "set_size":
            sprite.size = Math.max(
              10,
              Math.min(300, parseFloat(getInputValue(block, "size")) || 100)
            );
            break;

          case "say":
            console.log(
              `${sprite.name} says: ${getInputValue(block, "text") || "Hello!"}`
            );
            break;
        }

        newSprites[spriteIndex] = sprite;
        return newSprites;
      });

      if (block.type === "wait") {
        const seconds =
          (parseFloat(getInputValue(block, "seconds")) || 1) * 1000;
        setTimeout(resolve, seconds);
      } else {
        setTimeout(resolve, 50);
      }
    });
  }, []);

  const getInputValue = (block, inputName) => {
    if (!block.inputs) return null;
    const input = block.inputs.find((i) => i.name === inputName);
    return input ? input.value : null;
  };

  const findConnectedBlocks = useCallback(
    (startBlock) => {
      const connected = [];
      const BLOCK_HEIGHT = 40;
      const X_TOLERANCE = 80;
      const Y_TOLERANCE = 50;

      const candidateBlocks = workspaceBlocks
        .filter((block) => !block.isHat && block.id !== startBlock.id)
        .sort((a, b) => a.y - b.y);

      let currentY = startBlock.y + BLOCK_HEIGHT;

      for (const block of candidateBlocks) {
        const isXAligned = Math.abs(block.x - startBlock.x) < X_TOLERANCE;
        const isYConnected = Math.abs(block.y - currentY) < Y_TOLERANCE;

        if (isXAligned && isYConnected) {
          connected.push(block);
          currentY = block.y + BLOCK_HEIGHT;

          if (block.isC) {
            const innerBlocks = findInnerBlocks(block);
            block.innerBlocks = innerBlocks;
          }
        }
      }

      return connected;
    },
    [workspaceBlocks]
  );

  const findInnerBlocks = useCallback(
    (cBlock) => {
      const INNER_X_OFFSET = 30;
      const INNER_Y_OFFSET = 30;
      const C_BLOCK_WIDTH = 200;

      return workspaceBlocks
        .filter(
          (block) =>
            !block.isHat &&
            !block.isC &&
            block.id !== cBlock.id &&
            block.x > cBlock.x + INNER_X_OFFSET &&
            block.x < cBlock.x + C_BLOCK_WIDTH &&
            block.y > cBlock.y + INNER_Y_OFFSET &&
            block.y < cBlock.y + 100
        )
        .sort((a, b) => a.y - b.y);
    },
    [workspaceBlocks]
  );

  const executeBlockSequence = useCallback(
    async (blocks, spriteIndex) => {
      for (const block of blocks) {
        if (!executionRef.current) break;

        if (block.type === "repeat") {
          const times = parseInt(getInputValue(block, "times")) || 10;
          const innerBlocks = block.innerBlocks || [];

          for (let i = 0; i < times && executionRef.current; i++) {
            await executeBlockSequence(innerBlocks, spriteIndex);
          }
        } else if (block.type === "forever") {
          const innerBlocks = block.innerBlocks || [];

          while (executionRef.current) {
            await executeBlockSequence(innerBlocks, spriteIndex);
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
        } else {
          await executeBlock(block, spriteIndex);
        }
      }
    },
    [executeBlock]
  );

  const executeBlocks = useCallback(async () => {
    if (isRunning) return;

    setIsRunning(true);
    executionRef.current = true;

    const eventBlocks = workspaceBlocks
      .filter((block) => block.isHat && block.type === "when_flag")
      .sort((a, b) => a.y - b.y);

    if (eventBlocks.length === 0) {
      alert('Add a "when flag clicked" block to start!');
      setIsRunning(false);
      executionRef.current = false;
      return;
    }

    const executionPromises = eventBlocks.map(async (eventBlock) => {
      const connectedBlocks = findConnectedBlocks(eventBlock);
      await executeBlockSequence(connectedBlocks, selectedSprite);
    });

    try {
      await Promise.all(executionPromises);
    } catch (error) {
      console.error("Execution error:", error);
    }

    setIsRunning(false);
    executionRef.current = false;
  }, [
    workspaceBlocks,
    selectedSprite,
    findConnectedBlocks,
    executeBlockSequence,
    isRunning,
  ]);

  const stopExecution = () => {
    setIsRunning(false);
    executionRef.current = false;
  };

  const resetSprites = () => {
    setSprites((prev) =>
      prev.map((sprite) => ({
        ...sprite,
        x: 0,
        y: 0,
        direction: 90,
        size: 100,
        visible: true,
      }))
    );
  };

  const updateBlockInput = (blockId, inputName, newValue) => {
    setWorkspaceBlocks((prev) =>
      prev.map((block) => {
        if (block.id === blockId && block.inputs) {
          const newInputs = block.inputs.map((input) => {
            if (input.name === inputName) {
              return { ...input, value: newValue };
            }
            return input;
          });
          return { ...block, inputs: newInputs };
        }
        return block;
      })
    );
  };

  const removeBlock = (blockId) => {
    setWorkspaceBlocks((prev) => prev.filter((block) => block.id !== blockId));
  };

  const addNewSprite = () => {
    if (!newSpriteName.trim()) return;

    const newSprite = {
      id: Date.now(),
      name: newSpriteName,
      x: Math.floor(Math.random() * 100) - 50,
      y: Math.floor(Math.random() * 100) - 50,
      direction: 90,
      size: 100,
      visible: true,
    };

    setSprites((prev) => [...prev, newSprite]);
    setSelectedSprite(sprites.length);
    setNewSpriteName("");
    setShowSpriteModal(false);
  };

  const deleteSprite = (index) => {
    if (sprites.length <= 1) return;

    setSprites((prev) => prev.filter((_, i) => i !== index));
    if (selectedSprite >= index) {
      setSelectedSprite(Math.max(0, selectedSprite - 1));
    }
  };

  const renderBlock = (block, isInPalette = false) => {
    const category = categories.find((cat) =>
      cat.blocks.some((b) => b.type === block.type)
    );
    const colorClass =
      category?.color || "bg-gradient-to-br from-slate-500 to-slate-600";

    const renderBlockContent = () => {
      if (isInPalette) {
        return (
          <span>
            {block.text.replace(/\{.*?\}/g, (match) =>
              match.replace(/\{|\}/g, "")
            )}
          </span>
        );
      }

      const parts = block.text.split(/(\{.*?\})/);
      return parts.map((part, index) => {
        if (part.startsWith("{") && part.endsWith("}")) {
          const inputName = part.slice(1, -1);
          const input = block.inputs?.find((i) => i.name === inputName);

          if (input) {
            return (
              <input
                key={`${block.id}-input-${inputName}-${index}`}
                type={input.type === "number" ? "number" : "text"}
                value={input.value}
                onChange={(e) =>
                  updateBlockInput(
                    block.id,
                    inputName,
                    input.type === "number"
                      ? parseFloat(e.target.value) || 0
                      : e.target.value
                  )
                }
                className="bg-slate-50 text-slate-800 border border-slate-300 rounded-md px-2 py-1 text-xs w-16 text-center font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onClick={(e) => e.stopPropagation()}
              />
            );
          }
        }
        return <span key={`${block.id}-text-${index}`}>{part}</span>;
      });
    };

    return (
      <div
        key={
          block.id || `${block.type}-${isInPalette ? "palette" : "workspace"}`
        }
        className={`${colorClass} text-white p-3 m-2 rounded-xl cursor-pointer select-none text-sm font-medium relative shadow-lg transition-all duration-200 ${
          block.isHat ? "rounded-t-3xl" : ""
        } ${block.isC ? "min-h-24 pb-14" : ""} ${
          isInPalette
            ? "hover:scale-105 hover:shadow-xl transform"
            : "border-2 border-white/20 backdrop-blur-sm"
        }`}
        draggable={isInPalette}
        onDragStart={(e) => isInPalette && handleDragStart(e, block)}
        onDoubleClick={() => !isInPalette && removeBlock(block.id)}
        style={
          !isInPalette
            ? {
                position: "absolute",
                left: block.x,
                top: block.y,
                zIndex: 10,
                minWidth: "190px",
              }
            : { minWidth: "170px" }
        }
      >
        <div className="flex items-center gap-2 flex-wrap">
          {renderBlockContent()}
        </div>

        {block.isC && (
          <div className="mt-3 min-h-14 border-l-4 border-white/50 ml-4 pl-4 absolute bottom-3 left-2 right-2 bg-black/20 rounded-lg backdrop-blur-sm">
            <div className="text-xs opacity-80 pt-3 font-medium">
              Drop blocks here
            </div>
          </div>
        )}

        {!isInPalette && (
          <div
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-all duration-200 cursor-pointer shadow-lg hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              removeBlock(block.id);
            }}
          >
            ×
          </div>
        )}
      </div>
    );
  };

  const [catImage, setCatImage] = useState(null);

  useEffect(() => {
    const loadCatImage = () => {
      const img = new Image();
      img.onload = () => setCatImage(img);
      img.onerror = () => console.error("Failed to load cat2.png");
      img.src = "cat2.png";
    };

    loadCatImage();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Soft gradient background
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    gradient.addColorStop(0, "#f8fafc");
    gradient.addColorStop(1, "#e2e8f0");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid lines
    ctx.strokeStyle = "#e1e5e9";
    ctx.lineWidth = 1;

    for (let i = 0; i <= canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }

    for (let i = 0; i <= canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Center axes with better styling
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    sprites.forEach((sprite, index) => {
      if (!sprite.visible) return;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const spriteX = centerX + sprite.x;
      const spriteY = centerY - sprite.y;

      if (index === selectedSprite) {
        ctx.strokeStyle = "#0000";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(spriteX, spriteY, 28 * (sprite.size / 100), 0, 2 * Math.PI);
        ctx.stroke();
      }

      if (catImage) {
        ctx.save();
        ctx.translate(spriteX, spriteY);
        ctx.rotate(((sprite.direction - 90) * Math.PI) / 180);
        ctx.scale(sprite.size / 100, sprite.size / 100);

        const baseWidth = 70;
        const baseHeight = 80;

        const imageWidth = baseWidth * (sprite.size / 100);
        const imageHeight = baseHeight * (sprite.size / 100);

        ctx.drawImage(
          catImage,
          -imageWidth / 2,
          -imageHeight / 2,
          imageWidth,
          imageHeight
        );

        ctx.restore();
      } else {
        ctx.fillStyle = "#ff8c1a";
        ctx.beginPath();
        ctx.arc(spriteX, spriteY, 20 * (sprite.size / 100), 0, 2 * Math.PI);
        ctx.fill();
      }

      // Enhanced info text
      ctx.fillStyle = "#64748b";
      ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(
        `x: ${Math.round(sprite.x)} y: ${Math.round(sprite.y)}`,
        spriteX + 30,
        spriteY - 20
      );
      ctx.fillText(
        `direction: ${Math.round(sprite.direction)}°`,
        spriteX + 30,
        spriteY - 6
      );
      ctx.fillText(
        `size: ${Math.round(sprite.size)}%`,
        spriteX + 30,
        spriteY + 8
      );
    });
  }, [sprites, selectedSprite, catImage]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === "Space" && e.target.tagName !== "INPUT") {
        e.preventDefault();
        if (isRunning) {
          stopExecution();
        } else {
          executeBlocks();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isRunning, executeBlocks]);

  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      {/* Enhanced Block Palette */}
      <div className="w-72 bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 border-r border-slate-200 overflow-y-auto flex-shrink-0 shadow-lg">
        <div className="p-4 border-b border-slate-200 bg-white/50 backdrop-blur-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-3">
            Block Palette
          </h2>
          <div className="flex flex-col space-y-2">
            {categories.map((category) => (
              <button
                key={category.name}
                className={`text-left p-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                  selectedCategory === category.name
                    ? `${category.color} text-white shadow-lg transform scale-105`
                    : "bg-white/80 text-slate-700 hover:bg-white hover:shadow-md hover:scale-102"
                }`}
                onClick={() => setSelectedCategory(category.name)}
              >
                <span className="text-lg">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">
            {currentCategory?.name} Blocks
          </h3>
          {currentCategory?.blocks.map((block, index) => (
            <div key={`${block.type}-${index}`}>{renderBlock(block, true)}</div>
          ))}
          {currentCategory?.blocks.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <div className="text-3xl mb-2">🚧</div>
              <div className="text-sm">No blocks yet</div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Enhanced Top Bar */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 p-4 flex items-center gap-4 flex-shrink-0 shadow-sm">
          <button
            className={`px-6 py-3 rounded-xl flex items-center gap-3 font-semibold transition-all duration-200 shadow-lg ${
              isRunning
                ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
            }`}
            onClick={isRunning ? stopExecution : executeBlocks}
          >
            {isRunning ? (
              <>
                <Square size={18} />
                Stop
              </>
            ) : (
              <>
                <Play size={18} />
                Run
              </>
            )}
          </button>
          <button
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg flex items-center gap-3"
            onClick={resetSprites}
          >
            <RotateCcw size={18} />
            Reset
          </button>
          <div className="flex-1"></div>
          <div className="text-sm text-slate-600 bg-white/80 px-4 py-2 rounded-lg border border-slate-200">
            Press{" "}
            <span className="font-mono bg-slate-100 px-2 py-1 rounded">
              Space
            </span>{" "}
            to {isRunning ? "stop" : "run"}
          </div>
        </div>

        {/* Workspace and Stage */}
        <div className="flex flex-1 overflow-hidden">
          {/* Enhanced Code Workspace */}
          <div className="flex-1 bg-gradient-to-br from-white to-slate-50 relative overflow-auto">
            <div
              ref={workspaceRef}
              className="w-full h-full min-h-full relative bg-white/50 backdrop-blur-sm"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {workspaceBlocks.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-lg pointer-events-none">
                  <div className="text-center max-w-md">
                    <div className="text-4xl mb-4">🧩</div>
                    <div className="text-xl font-medium text-slate-500 mb-2">
                      Drag blocks here to start coding!
                    </div>
                    <p className="text-sm text-slate-400">
                      Select blocks from the palette on the left and arrange
                      them to create your program
                    </p>
                  </div>
                </div>
              )}

              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle, #94a3b8 1px, transparent 1px)`,
                  backgroundSize: "40px 40px",
                }}
              ></div>

              {workspaceBlocks.map((block) => renderBlock(block, false))}
            </div>
          </div>

          {/* Enhanced Stage Panel */}
          <div className="w-[468] bg-white/80 backdrop-blur-sm border-l border-slate-200 flex flex-col">
            {/* Stage Canvas */}
            <div className="p-5 border-b border-slate-200">
              <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 p-2 rounded-lg">
                  🎭
                </span>
                Stage
              </h3>
              <div className="border-2 border-slate-200 bg-white rounded-xl overflow-hidden shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={400} // Previously 320
                  height={300} // Previously 240
                  className="block"
                />
              </div>
            </div>

            {/* Enhanced Sprite List */}
            <div className="p-5 flex-1 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <span className="bg-purple-100 text-purple-800 p-2 rounded-lg">
                    🎨
                  </span>
                  Sprites
                </h3>
                <button
                  className="p-2 text-white bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:scale-110"
                  onClick={() => setShowSpriteModal(true)}
                >
                  <Plus size={18} />
                </button>
              </div>

              <div className="space-y-3">
                {sprites.map((sprite, index) => (
                  <div
                    key={sprite.id}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedSprite === index
                        ? "bg-indigo-50 border-2 border-indigo-200"
                        : "bg-white hover:bg-slate-50 border border-slate-100"
                    }`}
                    onClick={() => setSelectedSprite(index)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                          selectedSprite === index
                            ? "bg-gradient-to-r from-indigo-500 to-indigo-600"
                            : "bg-gradient-to-r from-slate-500 to-slate-600"
                        }`}
                      >
                        {sprite.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-800">
                          {sprite.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          x: {Math.round(sprite.x)}, y: {Math.round(sprite.y)}
                        </div>
                      </div>
                    </div>
                    <button
                      className={`p-2 rounded-full transition-all duration-200 ${
                        sprites.length <= 1
                          ? "text-slate-300 cursor-not-allowed"
                          : "text-slate-500 hover:text-red-500 hover:bg-red-50"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSprite(index);
                      }}
                      disabled={sprites.length <= 1}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Add Sprite Modal */}
      {showSpriteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl text-slate-800">
                Add New Sprite
              </h3>
              <button
                className="text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => {
                  setShowSpriteModal(false);
                  setNewSpriteName("");
                }}
              >
                ✕
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sprite Name
              </label>
              <input
                type="text"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                value={newSpriteName}
                onChange={(e) => setNewSpriteName(e.target.value)}
                placeholder="Enter sprite name"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                className="px-5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors duration-200 font-medium"
                onClick={() => {
                  setShowSpriteModal(false);
                  setNewSpriteName("");
                }}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-md"
                onClick={addNewSprite}
              >
                Add Sprite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScratchClone;
