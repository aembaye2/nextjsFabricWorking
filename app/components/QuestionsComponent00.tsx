"use client";
import React, { useState, useRef } from "react";
import { saveAs } from "file-saver";
import { PDFDocument, StandardFonts, PDFPage } from "pdf-lib";
import DrawingApp from "./DrawingApp";

interface Question {
  label: string;
  qtype: string;
  options?: string[];
}

interface QuestionsComponentProps {
  questions: Question[];
}

const QuestionsComponent: React.FC<QuestionsComponentProps> = ({
  questions,
}) => {
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [fullname, setfullname] = useState("");

  interface UserAnswers {
    [key: number]: string;
  }

  const handleInputChange = (questionId: number, value: string) => {
    setUserAnswers((prev: UserAnswers) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const generateCanvasImage = async (index: number) => {
    
    const mainCanvasId = `canvas-canvas-${index}`
    const backgroundCanvasId = `backgroundimage-canvas-canvas-${index}`

    // Function to combine main and background canvases
    async function combineCanvases(mainCanvasId: string, backgroundCanvasId: string): Promise<string> {
      const mainCanvas = document.getElementById(mainCanvasId) as HTMLCanvasElement;
      const backgroundCanvas = document.getElementById(backgroundCanvasId) as HTMLCanvasElement;

      // Create a temporary canvas with the same dimensions
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = mainCanvas.width;
      tempCanvas.height = mainCanvas.height;
      const tempCtx = tempCanvas.getContext("2d");

      if (!tempCtx) {
      throw new Error("Failed to get 2D context");
      }

      // Draw the background canvas first
      tempCtx.drawImage(
      backgroundCanvas,
      0,
      0,
      tempCanvas.width,
      tempCanvas.height
      );

      // Draw the main canvas on top
      tempCtx.drawImage(
      mainCanvas,
      0,
      0,
      tempCanvas.width,
      tempCanvas.height
      );

      // Return the combined image as a data URL
      return tempCanvas.toDataURL("image/png");
    }

    // Generate the combined image
    const combinedCanvasImage = await combineCanvases(
      mainCanvasId,
      backgroundCanvasId
    )
    return "";
  };

  interface UserInputData {
    label: string;
    qtype: string;
    options?: string[];
    "user-answer": string;
  }

  const handleGeneratePDF = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const userInputData: UserInputData[] = questions.map((question, index) => ({
      ...question,
      "user-answer": userAnswers[index] || "",
    }));

    let canvasImage = "";
    for (const [index, question] of userInputData.entries()) {
      if (question.qtype === "graphing-quest") {
        canvasImage = await generateCanvasImage(index);
        console.log("This is what is fetched from the canvas:", canvasImage);
      }
    }

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const paddingLeft = 20;
    const pageHeight = 800;
    const pageWidth = 600;
    let yOffset = pageHeight - 50;

    const addNewPage = (): PDFPage => {
      const page = pdfDoc.addPage([pageWidth, pageHeight]);
      yOffset = pageHeight - 50;
      return page;
    };

    let page = addNewPage();

    page.drawText(`Full Name: ${fullname}`, {
      x: paddingLeft,
      y: yOffset,
      size: 14,
      font: boldFont,
    });
    yOffset -= 40;

    for (const [index, question] of userInputData.entries()) {
      if (yOffset < 100) {
        page = addNewPage();
      }

      page.drawText(`${index + 1}. ${question.label}`, {
        x: paddingLeft,
        y: yOffset,
        size: 12,
        font: font,
      });
      yOffset -= 20;

      if (question.qtype === "mc-quest") {
        for (const option of question.options || []) {
          if (yOffset < 100) {
            page = addNewPage();
          }

          page.drawText(option, {
            x: paddingLeft + 20,
            y: yOffset,
            size: 10,
            font: font,
          });
          yOffset -= 15;
        }
      }

      if (yOffset < 100) {
        page = addNewPage();
      }

      page.drawText(`Answer: ${question["user-answer"]}`, {
        x: paddingLeft,
        y: yOffset,
        size: 12,
        font: boldFont,
      });
      yOffset -= 30;

      if (question.qtype === "graphing-quest" && canvasImage) {
        if (yOffset < 250) {
          page = addNewPage();
        }

        const pngImage = await pdfDoc.embedPng(canvasImage);
        page.drawImage(pngImage, {
          x: paddingLeft,
          y: yOffset - 200,
          width: 200,
          height: 200,
        });
        yOffset -= 250;
      }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    saveAs(blob, "user-input.pdf");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        paddingLeft: "20px",
      }}
    >
      <div style={{ textAlign: "right", padding: "20px" }}>
        <button type="button" onClick={handleGeneratePDF}>
          Generate PDF
        </button>
      </div>
      <form style={{ flex: "1" }}>
        <div style={{ marginBottom: "30px" }}>
          <label>
            Full Name:
            <input
              type="text"
              value={fullname}
              onChange={(e) => setfullname(e.target.value)}
              style={{ marginLeft: "10px", width: "400px", height: "35px" }}
            />
          </label>
        </div>
        {questions.map((question, index) => (
          <div key={index} style={{ marginBottom: "30px" }}>
            <label>
              {index + 1}. {question.label}
            </label>
            {question.qtype === "mc-quest" && (
              <div>
                {question.options &&
                  question.options.map((option, i) => (
                    <div key={i}>
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        onChange={() => handleInputChange(index, option)}
                      />
                      {option}
                    </div>
                  ))}
              </div>
            )}
            {question.qtype === "float-num-quest" && (
              <div style={{ marginTop: "10px" }}>
                <input
                  type="number"
                  onChange={(e) => handleInputChange(index, e.target.value)}
                />
              </div>
            )}
            {question.qtype === "one-line-text-quest" && (
              <div style={{ marginTop: "10px" }}>
                <input
                  type="text"
                  maxLength={150}
                  style={{ width: "100%" }}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                />
              </div>
            )}
            {question.qtype === "manylines-text-quest" && (
              <div style={{ marginTop: "10px" }}>
                <textarea
                  maxLength={500}
                  style={{ width: "100%", height: "100px" }}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                />
              </div>
            )}
            {question.qtype === "graphing-quest" && (
              <div
                style={{
                  marginTop: "50px",
                  marginLeft: "50px",
                  marginBottom: "400px",
                }}
              >
                <DrawingApp />
              </div>
            )}
          </div>
        ))}
      </form>
    </div>
  );
};

export default QuestionsComponent;
