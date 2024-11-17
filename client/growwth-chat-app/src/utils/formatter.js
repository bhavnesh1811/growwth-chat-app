export const formatTimestamp = (timestamp) => {
    try {
      const adjustedTimestamp =
        String(timestamp).length === 10 ? timestamp * 1000 : timestamp;
      const date = new Date(adjustedTimestamp);
  
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }
  
      return new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Invalid time";
    }
  };