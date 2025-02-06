export const drawWithPen = (ctx, path, point) => {
    path.push(point);
    ctx.lineTo(point[0], point[1]);
    ctx.stroke();
  };
  
  export const renderPenPaths = (ctx, paths) => {
    paths.forEach((pathData) => {
      if (!pathData || !pathData.options || !pathData.path || pathData.path.length < 2) return;
      ctx.strokeStyle = pathData.options.lineColor
        ? `rgba(${pathData.options.lineColor.r}, ${pathData.options.lineColor.g}, ${pathData.options.lineColor.b}, ${pathData.options.lineColor.a})`
        : "#000";
      ctx.lineWidth = pathData.options.lineWidth || 2;
      ctx.beginPath();
      ctx.moveTo(pathData.path[0][0], pathData.path[0][1]);
      for (let i = 1; i < pathData.path.length; i++) {
        ctx.lineTo(pathData.path[i][0], pathData.path[i][1]);
      }
      ctx.stroke();
    });
  };
  