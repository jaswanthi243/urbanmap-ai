import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Download,
  FileImage,
  FileText,
  Gauge,
  Layers3,
  Map,
  Menu,
  Moon,
  MoreHorizontal,
  ScanLine,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
  X,
  Zap
} from "lucide-react";

import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import "./styles.css";


/* =========================================================
   BACKEND URL
   ========================================================= */

const API_URL = "https://urbanmap-ai-backend.onrender.com";


/* =========================================================
   CHART DATA
   ========================================================= */

const chartData = [
  { name: "08:00", parcels: 18 },
  { name: "09:00", parcels: 31 },
  { name: "10:00", parcels: 45 },
  { name: "11:00", parcels: 57 },
  { name: "12:00", parcels: 68 },
  { name: "13:00", parcels: 76 },
  { name: "14:00", parcels: 84 }
];


/* =========================================================
   DEFAULT FEATURES
   ========================================================= */

const defaultFeatures = [
  {
    label: "Parcel Boundaries",
    value: 0,
    confidence: "—"
  },
  {
    label: "Buildings",
    value: 0,
    confidence: "—"
  },
  {
    label: "Road Segments",
    value: 0,
    confidence: "—"
  },
  {
    label: "Water Features",
    value: 0,
    confidence: "—"
  }
];


/* =========================================================
   APP
   ========================================================= */

function App() {

  /* -------------------------------------------------------
     NAVIGATION
     ------------------------------------------------------- */

  const [active, setActive] = useState("Overview");

  /* -------------------------------------------------------
     UI STATE
     ------------------------------------------------------- */

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [sidebar, setSidebar] = useState(true);
  const [dark, setDark] = useState(true);
  const [search, setSearch] = useState("");

  /* -------------------------------------------------------
     RESULT STATE
     ------------------------------------------------------- */

  const [result, setResult] = useState(null);

  /* -------------------------------------------------------
     ERROR STATE
     ------------------------------------------------------- */

  const [error, setError] = useState("");

  /* -------------------------------------------------------
     TOAST STATE
     ------------------------------------------------------- */

  const [showToast, setShowToast] = useState(false);

  /* -------------------------------------------------------
     LOCAL IMAGE PREVIEW
     ------------------------------------------------------- */

  const [previewUrl, setPreviewUrl] = useState(null);


  /* =======================================================
     CREATE IMAGE PREVIEW
     ======================================================= */

  useEffect(() => {

    if (!file) {

      setPreviewUrl(null);

      return;
    }

    const url = URL.createObjectURL(file);

    setPreviewUrl(url);

    return () => {

      URL.revokeObjectURL(url);

    };

  }, [file]);


  /* =======================================================
     SELECT FILE
     ======================================================= */

  const selectFile = (selectedFile) => {

    if (!selectedFile) {
      return;
    }

    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/tiff",
      "image/webp"
    ];

    const validExtension =
      /\.(jpg|jpeg|png|tif|tiff|webp)$/i.test(
        selectedFile.name
      );

    if (
      !validTypes.includes(selectedFile.type) &&
      !validExtension
    ) {

      setError(
        "Please upload JPG, PNG, TIFF or WEBP imagery."
      );

      return;
    }

    setFile(selectedFile);

    setProcessed(false);

    setProcessing(false);

    setResult(null);

    setError("");

    setShowToast(false);
  };


  /* =======================================================
     DRAG & DROP
     ======================================================= */

  const handleDrop = (event) => {

    event.preventDefault();

    setDragging(false);

    const droppedFile =
      event.dataTransfer.files?.[0];

    selectFile(droppedFile);
  };


  /* =======================================================
     RUN REAL AI ANALYSIS
     ======================================================= */

  const runAnalysis = async () => {

    if (!file) {

      setError(
        "Please upload a drone image first."
      );

      return;
    }

    setProcessing(true);

    setProcessed(false);

    setError("");

    setShowToast(false);

    try {

      const formData = new FormData();

      formData.append(
        "file",
        file
      );


      const response = await fetch(
        `${API_URL}/analyze`,
        {
          method: "POST",
          body: formData
        }
      );


      if (!response.ok) {

        throw new Error(
          `Backend returned ${response.status}`
        );
      }


      const data =
        await response.json();


      if (data.status !== "success") {

        throw new Error(
          data.message ||
          "Analysis failed."
        );
      }


      setResult(data);

      setProcessed(true);

      setActive("Analysis");

      setShowToast(true);

    } catch (err) {

      console.error(err);

      setError(
        "Unable to connect to UrbanMap AI backend. Make sure FastAPI is running on port 8000."
      );

    } finally {

      setProcessing(false);

    }
  };


  /* =======================================================
     RESET
     ======================================================= */

  const reset = () => {

    setFile(null);

    setPreviewUrl(null);

    setResult(null);

    setProcessed(false);

    setProcessing(false);

    setError("");

    setShowToast(false);
  };


  /* =======================================================
     COUNTS
     ======================================================= */

  const detected =
    result?.detected_features || {};


  const parcelCount =
    detected.parcel_boundaries ?? 0;


  const buildingCount =
    detected.buildings ?? 0;


  const roadCount =
    detected.roads ?? 0;


  const waterCount =
    detected.water_features ?? 0;


  const processingTime =
    result?.processing_seconds != null
      ? `${Number(
          result.processing_seconds
        ).toFixed(2)}s`
      : "—";


  /* =======================================================
     FEATURE LIST
     ======================================================= */

  const features = result
    ? [
        {
          label: "Parcel Boundaries",
          value: parcelCount,
          confidence:
            result.confidence
              ? `${result.confidence}%`
              : "—"
        },

        {
          label: "Buildings",
          value: buildingCount,
          confidence:
            result.confidence
              ? `${Math.max(
                  Number(result.confidence) - 1.5,
                  0
                ).toFixed(1)}%`
              : "—"
        },

        {
          label: "Road Segments",
          value: roadCount,
          confidence:
            result.confidence
              ? `${Math.max(
                  Number(result.confidence) - 2.5,
                  0
                ).toFixed(1)}%`
              : "—"
        },

        {
          label: "Water Features",
          value: waterCount,
          confidence:
            result.confidence
              ? `${Math.max(
                  Number(result.confidence) - 3.5,
                  0
                ).toFixed(1)}%`
              : "—"
        }
      ]
    : defaultFeatures;


  /* =======================================================
     DOWNLOAD REPORT
     ======================================================= */

  const exportReport = () => {

    if (!result) {

      setError(
        "Run AI Analysis before exporting a report."
      );

      return;
    }


    const report = {

      application:
        "UrbanMap AI",

      generated_at:
        new Date().toISOString(),

      filename:
        result.filename,

      detector_mode:
        result.detector_mode,

      image_width:
        result.image_width,

      image_height:
        result.image_height,

      processing_seconds:
        result.processing_seconds,

      confidence:
        result.confidence,

      detected_features:
        result.detected_features
    };


    const blob =
      new Blob(
        [
          JSON.stringify(
            report,
            null,
            2
          )
        ],
        {
          type:
            "application/json"
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      "urbanmap-ai-report.json";

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
      url
    );
  };


  /* =======================================================
     PROCESSED IMAGE
     ======================================================= */

  const processedImage =
    result?.preview_image
      ? `data:image/jpeg;base64,${result.preview_image}`
      : previewUrl;


  /* =======================================================
     NAVIGATION
     ======================================================= */

  const navigate = (page) => {

    setActive(page);

    setError("");

  };


  /* =======================================================
     MAIN UI
     ======================================================= */

  return (

    <div
      className={
        dark
          ? "app"
          : "app light"
      }
    >

      {/* =================================================
          SIDEBAR
      ================================================= */}

      {sidebar && (

        <aside className="sidebar">

          {/* BRAND */}

          <div className="brand">

            <div className="brand-mark">

              <ScanLine
                size={22}
              />

            </div>

            <div>

              <strong>
                UrbanMap
                <span> AI</span>
              </strong>

              <small>
                GEOSPATIAL INTELLIGENCE
              </small>

            </div>

          </div>


          {/* WORKSPACE */}

          <div className="workspace">

            <span className="workspace-dot"></span>

            <div>

              <small>
                WORKSPACE
              </small>

              <b>
                Urban Planning Lab
              </b>

            </div>

            <ChevronDown
              size={15}
            />

          </div>


          {/* NAVIGATION */}

          <nav>

            <p className="nav-label">
              MAIN MENU
            </p>


            {[
              ["Overview", Gauge],
              ["Map Explorer", Map],
              ["Analysis", BrainCircuit],
              ["Projects", Layers3],
              ["Reports", FileText]
            ].map(
              ([label, Icon]) => (

                <button
                  key={label}
                  className={
                    active === label
                      ? "nav-item active"
                      : "nav-item"
                  }
                  onClick={() =>
                    navigate(label)
                  }
                >

                  <Icon
                    size={18}
                  />

                  <span>
                    {label}
                  </span>

                  {label === "Analysis" &&
                    processed && (
                      <i></i>
                    )}

                </button>

              )
            )}


            <p className="nav-label space-top">
              SYSTEM
            </p>


            {[
              ["Settings", Settings],
              ["Help Center", CircleHelp]
            ].map(
              ([label, Icon]) => (

                <button
                  key={label}
                  className={
                    active === label
                      ? "nav-item active"
                      : "nav-item"
                  }
                  onClick={() =>
                    navigate(label)
                  }
                >

                  <Icon
                    size={18}
                  />

                  <span>
                    {label}
                  </span>

                </button>

              )
            )}

          </nav>


          {/* SIDEBAR BOTTOM */}

          <div className="sidebar-bottom">

            <div className="ai-card">

              <Sparkles
                size={18}
              />

              <div>

                <b>
                  AI Engine Ready
                </b>

                <span>
                  OpenCV Vision Engine
                </span>

              </div>

              <span className="online"></span>

            </div>


            <div className="user-card">

              <div className="avatar">
                JJ
              </div>

              <div>

                <b>
                  Jaswanthi
                </b>

                <span>
                  GIS Analyst
                </span>

              </div>

              <MoreHorizontal
                size={18}
                className="muted"
              />

            </div>

          </div>

        </aside>

      )}


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="main">


        {/* TOP BAR */}

        <header className="topbar">

          <button
            className="icon-button"
            onClick={() =>
              setSidebar(!sidebar)
            }
          >

            <Menu
              size={20}
            />

          </button>


          <div className="breadcrumb">

            <span>
              UrbanMap AI
            </span>

            <ArrowRight
              size={14}
            />

            <b>
              {active}
            </b>

          </div>


          <div className="top-actions">

            <div className="search-box">

              <Search
                size={17}
              />

              <input
                value={search}
                onChange={
                  (e) =>
                    setSearch(
                      e.target.value
                    )
                }
                placeholder="Search projects..."
              />

            </div>


            <button
              className="icon-button"
            >

              <Bell
                size={19}
              />

              <em></em>

            </button>


            <button
              className="icon-button"
              onClick={() =>
                setDark(!dark)
              }
            >

              {dark ? (
                <Moon
                  size={19}
                />
              ) : (
                <Zap
                  size={19}
                />
              )}

            </button>

          </div>

        </header>


        {/* =================================================
            CONTENT
        ================================================= */}

        <section className="content">


          {/* =================================================
              OVERVIEW / ANALYSIS HEADER
          ================================================= */}

          {(active === "Overview" ||
            active === "Analysis") && (

            <>

              <div className="hero">

                <div>

                  <div className="eyebrow">

                    <span></span>

                    AI-POWERED CADASTRAL MAPPING

                  </div>


                  <h1>

                    Turn drone imagery into
                    <br />

                    <span>
                      intelligent urban maps.
                    </span>

                  </h1>


                  <p>
                    Automatically detect parcels,
                    buildings, roads and cadastral
                    features from high-resolution
                    drone imagery using computer vision.
                  </p>

                </div>


                <div className="hero-orbit">

                  <div className="orbit orbit1"></div>

                  <div className="orbit orbit2"></div>

                  <div className="hero-core">

                    <Map
                      size={30}
                    />

                  </div>

                </div>

              </div>


              {/* =================================================
                  STATISTICS
              ================================================= */}

              <div className="stats">


                {/* IMAGERY */}

                <div className="stat-card">

                  <div className="stat-top">

                    <div className="stat-icon">

                      <FileImage
                        size={18}
                      />

                    </div>

                    <span className="change">
                      +8.4%
                    </span>

                  </div>

                  <span className="stat-title">
                    Imagery Processed
                  </span>

                  <strong>
                    {file ? "1" : "0"}
                  </strong>

                  <small>
                    current session
                  </small>

                </div>


                {/* PARCELS */}

                <div className="stat-card">

                  <div className="stat-top">

                    <div className="stat-icon">

                      <Target
                        size={18}
                      />

                    </div>

                    <span className="change">
                      AI
                    </span>

                  </div>

                  <span className="stat-title">
                    Parcels Detected
                  </span>

                  <strong>
                    {parcelCount}
                  </strong>

                  <small>
                    detected from imagery
                  </small>

                </div>


                {/* BUILDINGS */}

                <div className="stat-card">

                  <div className="stat-top">

                    <div className="stat-icon">

                      <Building2
                        size={18}
                      />

                    </div>

                    <span className="change">
                      AI
                    </span>

                  </div>

                  <span className="stat-title">
                    Buildings Mapped
                  </span>

                  <strong>
                    {buildingCount}
                  </strong>

                  <small>
                    detected from imagery
                  </small>

                </div>


                {/* PROCESSING */}

                <div className="stat-card">

                  <div className="stat-top">

                    <div className="stat-icon">

                      <Activity
                        size={18}
                      />

                    </div>

                    <span className="change">
                      LIVE
                    </span>

                  </div>

                  <span className="stat-title">
                    Processing Time
                  </span>

                  <strong>
                    {processingTime}
                  </strong>

                  <small>
                    current analysis
                  </small>

                </div>

              </div>

            </>

          )}


          {/* =================================================
              ANALYSIS PAGE
          ================================================= */}

          {active === "Analysis" && (

            <>

              <div className="grid-main">


                {/* =================================================
                    UPLOAD PANEL
                ================================================= */}

                <section className="panel upload-panel">

                  <div className="panel-head">

                    <div>

                      <h2>
                        Drone Imagery
                      </h2>

                      <p>
                        Upload a high-resolution
                        image to begin extraction.
                      </p>

                    </div>


                    {file && (

                      <button
                        className="text-button"
                        onClick={reset}
                      >

                        <X
                          size={15}
                        />

                        Clear

                      </button>

                    )}

                  </div>


                  {/* ERROR */}

                  {error && (

                    <div
                      style={{
                        padding: "12px 16px",
                        marginBottom: "15px",
                        borderRadius: "10px",
                        background:
                          "rgba(248,113,113,.12)",
                        color: "#fca5a5",
                        fontSize: "13px"
                      }}
                    >

                      {error}

                    </div>

                  )}


                  {/* =================================================
                      UPLOAD AREA
                  ================================================= */}

                  {!file ? (

                    <label
                      className={
                        dragging
                          ? "dropzone dragging"
                          : "dropzone"
                      }

                      onDragOver={(e) => {

                        e.preventDefault();

                        setDragging(true);

                      }}

                      onDragLeave={() =>
                        setDragging(false)
                      }

                      onDrop={handleDrop}
                    >

                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.tif,.tiff,.webp"
                        onChange={(e) =>
                          selectFile(
                            e.target.files?.[0]
                          )
                        }
                      />


                      <div className="upload-icon">

                        <Upload
                          size={26}
                        />

                      </div>


                      <h3>
                        Drop drone imagery here
                      </h3>


                      <p>

                        or{" "}

                        <span>
                          browse files
                        </span>

                        {" "}from your computer

                      </p>


                      <small>
                        JPG, PNG, TIFF, WEBP •
                        Maximum 500 MB
                      </small>

                    </label>

                  ) : (

                    /* =================================================
                       IMAGE PREVIEW
                    ================================================= */

                    <div className="preview-wrap">

                      <div className="preview-image">

                        <img
                          src={
                            processedImage
                          }
                          alt="Drone imagery preview"
                        />


                        {processed && (
                          <div className="image-grid"></div>
                        )}


                        <div className="image-badge">

                          <FileImage
                            size={14}
                          />

                          {processed
                            ? "AI EXTRACTED"
                            : "SOURCE IMAGE"}

                        </div>

                      </div>


                      <div className="file-meta">

                        <div className="file-icon">

                          <FileImage
                            size={20}
                          />

                        </div>


                        <div>

                          <b>
                            {file.name}
                          </b>

                          <span>
                            {(
                              file.size /
                              1024 /
                              1024
                            ).toFixed(2)}
                            {" "}MB •{" "}

                            {processed
                              ? "Analysis complete"
                              : "Ready for analysis"}

                          </span>

                        </div>


                        <CheckCircle2
                          className="success"
                          size={19}
                        />

                      </div>

                    </div>

                  )}


                  {/* =================================================
                      PIPELINE
                  ================================================= */}

                  <div className="panel-footer">

                    <div className="pipeline">

                      <div className="step done">

                        <span>
                          1
                        </span>

                        <b>
                          Upload
                        </b>

                      </div>


                      <i></i>


                      <div
                        className={
                          processing
                            ? "step current"
                            : processed
                            ? "step done"
                            : "step"
                        }
                      >

                        <span>
                          2
                        </span>

                        <b>
                          AI Analysis
                        </b>

                      </div>


                      <i></i>


                      <div
                        className={
                          processed
                            ? "step done"
                            : "step"
                        }
                      >

                        <span>
                          3
                        </span>

                        <b>
                          Export
                        </b>

                      </div>

                    </div>


                    <button
                      className="primary"
                      disabled={
                        !file ||
                        processing
                      }
                      onClick={
                        runAnalysis
                      }
                    >

                      {processing ? (

                        <>

                          <span className="spinner"></span>

                          Processing...

                        </>

                      ) : (

                        <>

                          <BrainCircuit
                            size={17}
                          />

                          Run AI Analysis

                        </>

                      )}

                    </button>

                  </div>

                </section>


                {/* =================================================
                    PROCESSING CHART
                ================================================= */}

                <section className="panel chart-panel">

                  <div className="panel-head">

                    <div>

                      <h2>
                        Processing Activity
                      </h2>

                      <p>
                        Parcels extracted
                        across recent jobs.
                      </p>

                    </div>


                    <button className="period">

                      Last 7 hours

                      <ChevronDown
                        size={14}
                      />

                    </button>

                  </div>


                  <div className="chart">

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <AreaChart
                        data={
                          chartData
                        }
                      >

                        <defs>

                          <linearGradient
                            id="fill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >

                            <stop
                              offset="0%"
                              stopOpacity=".28"
                            />

                            <stop
                              offset="100%"
                              stopOpacity=".01"
                            />

                          </linearGradient>

                        </defs>


                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="rgba(148,163,184,.12)"
                        />


                        <XAxis
                          dataKey="name"
                          tick={{
                            fontSize: 11
                          }}
                          axisLine={false}
                          tickLine={false}
                        />


                        <YAxis
                          tick={{
                            fontSize: 11
                          }}
                          axisLine={false}
                          tickLine={false}
                        />


                        <Tooltip
                          contentStyle={{
                            borderRadius: 12,
                            border:
                              "1px solid rgba(148,163,184,.15)",
                            background:
                              "#0d1828"
                          }}
                        />


                        <Area
                          type="monotone"
                          dataKey="parcels"
                          stroke="#5eead4"
                          strokeWidth={2.5}
                          fill="url(#fill)"
                        />

                      </AreaChart>

                    </ResponsiveContainer>

                  </div>


                  <div className="chart-foot">

                    <span>

                      <i></i>

                      Parcels detected

                    </span>


                    <b>
                      {parcelCount} current
                    </b>

                  </div>

                </section>

              </div>


              {/* =================================================
                  FEATURES
              ================================================= */}

              <section className="panel">

                <div className="panel-head">

                  <div>

                    <h2>
                      Extracted Features
                    </h2>

                    <p>
                      Results returned by
                      the UrbanMap AI pipeline.
                    </p>

                  </div>


                  <button
                    className="ghost"
                    onClick={() =>
                      setActive("Reports")
                    }
                  >

                    <BarChart3
                      size={16}
                    />

                    Details

                  </button>

                </div>


                <div className="feature-list">

                  {features.map(
                    (feature, index) => (

                      <div
                        className="feature"
                        key={
                          feature.label
                        }
                      >

                        <div
                          className={
                            "feature-icon fi" +
                            index
                          }
                        >

                          <Layers3
                            size={17}
                          />

                        </div>


                        <div className="feature-info">

                          <b>
                            {feature.label}
                          </b>

                          <span>
                            {feature.value}
                            {" "}detected
                          </span>

                        </div>


                        <div className="confidence">

                          <div>

                            <span
                              style={{
                                width:
                                  feature.confidence ===
                                  "—"
                                    ? "0%"
                                    : feature.confidence
                              }}
                            ></span>

                          </div>

                          <b>
                            {feature.confidence}
                          </b>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </section>

            </>

          )}


          {/* =================================================
              MAP EXPLORER
          ================================================= */}

          {active === "Map Explorer" && (

            <section className="panel map-card">

              <div className="panel-head">

                <div>

                  <h2>
                    Map Explorer
                  </h2>

                  <p>
                    Explore the extracted
                    cadastral visualization.
                  </p>

                </div>

                {result && (

                  <button
                    className="primary"
                    onClick={
                      exportReport
                    }
                  >

                    <Download
                      size={16}
                    />

                    Export JSON

                  </button>

                )}

              </div>


              <div
                className="mini-map"
                style={{
                  minHeight:
                    "520px",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  overflow:
                    "hidden"
                }}
              >

                {processedImage ? (

                  <img
                    src={
                      processedImage
                    }
                    alt="UrbanMap extracted map"
                    style={{
                      width:
                        "100%",
                      height:
                        "100%",
                      minHeight:
                        "520px",
                      objectFit:
                        "contain",
                      borderRadius:
                        "12px"
                    }}
                  />

                ) : (

                  <div
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "40px"
                    }}
                  >

                    <Map
                      size={50}
                    />

                    <h2>
                      No map available
                    </h2>

                    <p>
                      Upload a drone image
                      and run AI Analysis
                      first.
                    </p>

                  </div>

                )}

              </div>

            </section>

          )}


          {/* =================================================
              REPORTS
          ================================================= */}

          {active === "Reports" && (

            <>

              {!result ? (

                <section className="panel">

                  <div
                    style={{
                      padding:
                        "50px",
                      textAlign:
                        "center"
                    }}
                  >

                    <FileText
                      size={50}
                    />

                    <h2>
                      No Analysis Report
                    </h2>

                    <p>
                      Upload a drone image
                      and run the AI analysis
                      to generate a report.
                    </p>


                    <button
                      className="primary"
                      onClick={() =>
                        setActive(
                          "Analysis"
                        )
                      }
                    >

                      <BrainCircuit
                        size={17}
                      />

                      Go to Analysis

                    </button>

                  </div>

                </section>

              ) : (

                <section className="panel">

                  <div className="panel-head">

                    <div>

                      <h2>
                        Analysis Complete
                      </h2>

                      <p>
                        {result.filename}
                      </p>

                    </div>


                    <button
                      className="primary"
                      onClick={
                        exportReport
                      }
                    >

                      <Download
                        size={16}
                      />

                      Export Report

                    </button>

                  </div>


                  {/* REPORT CARDS */}

                  <div className="stats">

                    <div className="stat-card">

                      <span className="stat-title">
                        Parcel Boundaries
                      </span>

                      <strong>
                        {parcelCount}
                      </strong>

                      <small>
                        detected
                      </small>

                    </div>


                    <div className="stat-card">

                      <span className="stat-title">
                        Buildings
                      </span>

                      <strong>
                        {buildingCount}
                      </strong>

                      <small>
                        detected
                      </small>

                    </div>


                    <div className="stat-card">

                      <span className="stat-title">
                        Roads
                      </span>

                      <strong>
                        {roadCount}
                      </strong>

                      <small>
                        detected
                      </small>

                    </div>


                    <div className="stat-card">

                      <span className="stat-title">
                        Water Features
                      </span>

                      <strong>
                        {waterCount}
                      </strong>

                      <small>
                        detected
                      </small>

                    </div>

                  </div>


                  {/* IMAGE */}

                  {processedImage && (

                    <div
                      style={{
                        marginTop:
                          "25px"
                      }}
                    >

                      <h3>
                        AI Extracted Map
                      </h3>


                      <img
                        src={
                          processedImage
                        }
                        alt="AI extracted cadastral map"
                        style={{
                          width:
                            "100%",
                          maxHeight:
                            "650px",
                          objectFit:
                            "contain",
                          borderRadius:
                            "14px",
                          background:
                            "#07111f"
                        }}
                      />

                    </div>

                  )}


                  {/* JSON RESULT */}

                  <div
                    style={{
                      marginTop:
                        "25px",
                      padding:
                        "20px",
                      borderRadius:
                        "12px",
                      background:
                        "#07111f",
                      overflow:
                        "auto"
                    }}
                  >

                    <pre
                      style={{
                        margin: 0,
                        color:
                          "#8fffea",
                        fontSize:
                          "13px",
                        lineHeight:
                          "1.6"
                      }}
                    >

{JSON.stringify(
  {
    status:
      result.status,
    filename:
      result.filename,
    detector_mode:
      result.detector_mode,
    image_width:
      result.image_width,
    image_height:
      result.image_height,
    processing_seconds:
      result.processing_seconds,
    confidence:
      result.confidence,
    detected_features:
      result.detected_features
  },
  null,
  2
)}

                    </pre>

                  </div>

                </section>

              )}

            </>

          )}


          {/* =================================================
              PROJECTS
          ================================================= */}

          {active === "Projects" && (

            <section className="panel recent">

              <div className="panel-head">

                <div>

                  <h2>
                    Recent Projects
                  </h2>

                  <p>
                    Your latest urban
                    mapping projects.
                  </p>

                </div>

              </div>


              <div className="project-row">

                <div className="project-thumb thumb1">

                  <Map
                    size={20}
                  />

                </div>

                <div>

                  <b>
                    Hyderabad North Zone
                  </b>

                  <span>
                    Drone imagery project
                  </span>

                </div>

                <strong className="status complete">
                  Completed
                </strong>

              </div>


              <div className="project-row">

                <div className="project-thumb thumb2">

                  <Map
                    size={20}
                  />

                </div>

                <div>

                  <b>
                    Greenfield Layout
                  </b>

                  <span>
                    Parcel extraction
                  </span>

                </div>

                <strong className="status complete">
                  Completed
                </strong>

              </div>


              <div className="project-row">

                <div className="project-thumb thumb3">

                  <Map
                    size={20}
                  />

                </div>

                <div>

                  <b>
                    Urban Expansion Study
                  </b>

                  <span>
                    Cadastral analysis
                  </span>

                </div>

                <strong className="status processing">
                  Processed
                </strong>

              </div>

            </section>

          )}


          {/* =================================================
              SETTINGS
          ================================================= */}

          {active === "Settings" && (

            <section className="panel">

              <div className="panel-head">

                <div>

                  <h2>
                    Settings
                  </h2>

                  <p>
                    Configure your UrbanMap
                    AI workspace.
                  </p>

                </div>

              </div>


              <div className="feature-list">

                <div className="feature">

                  <div className="feature-icon fi0">

                    <Settings
                      size={18}
                    />

                  </div>

                  <div className="feature-info">

                    <b>
                      AI Engine
                    </b>

                    <span>
                      OpenCV Vision Engine
                    </span>

                  </div>

                  <strong>
                    Ready
                  </strong>

                </div>


                <div className="feature">

                  <div className="feature-icon fi1">

                    <ShieldCheck
                      size={18}
                    />

                  </div>

                  <div className="feature-info">

                    <b>
                      Processing
                    </b>

                    <span>
                      Local FastAPI backend
                    </span>

                  </div>

                  <strong>
                    Secure
                  </strong>

                </div>


                <div className="feature">

                  <div className="feature-icon fi2">

                    <Zap
                      size={18}
                    />

                  </div>

                  <div className="feature-info">

                    <b>
                      Theme
                    </b>

                    <span>
                      Switch between dark
                      and light interface
                    </span>

                  </div>

                  <button
                    className="ghost"
                    onClick={() =>
                      setDark(!dark)
                    }
                  >

                    {dark
                      ? "Light"
                      : "Dark"}

                  </button>

                </div>

              </div>

            </section>

          )}


          {/* =================================================
              HELP CENTER
          ================================================= */}

          {active === "Help Center" && (

            <section className="panel">

              <div
                style={{
                  padding:
                    "45px",
                  textAlign:
                    "center"
                }}
              >

                <CircleHelp
                  size={55}
                />

                <h2>
                  UrbanMap AI Help Center
                </h2>

                <p>
                  Upload a drone image,
                  run AI Analysis,
                  inspect the extracted
                  features and export
                  the JSON report.
                </p>


                <button
                  className="primary"
                  onClick={() =>
                    setActive(
                      "Analysis"
                    )
                  }
                >

                  <BrainCircuit
                    size={17}
                  />

                  Start Analysis

                </button>

              </div>

            </section>

          )}


          {/* =================================================
              FOOTER
          ================================================= */}

          <footer>

            <span>
              © 2026 UrbanMap AI
            </span>

            <span>
              AI-assisted mapping •
              Built for urban intelligence
            </span>

            <span>

              <ShieldCheck
                size={14}
              />

              Secure processing

            </span>

          </footer>

        </section>

      </main>


      {/* =================================================
          SUCCESS TOAST
      ================================================= */}

      {showToast &&
        processed &&
        result && (

          <div className="toast">

            <CheckCircle2
              size={19}
            />


            <div>

              <b>
                Analysis complete
              </b>

              <span>
                {parcelCount} parcels and{" "}
                {buildingCount} buildings
                extracted.
              </span>

            </div>


            <button
              onClick={() =>
                setActive(
                  "Reports"
                )
              }
            >

              <Download
                size={16}
              />

              Report

            </button>


            <button
              onClick={() =>
                setShowToast(false)
              }
              style={{
                background:
                  "transparent",
                border: "none",
                color:
                  "inherit",
                cursor:
                  "pointer"
              }}
            >

              <X
                size={15}
              />

            </button>

          </div>

        )}

    </div>
  );
}


/* =========================================================
   START REACT
   ========================================================= */

createRoot(
  document.getElementById("root")
).render(
  <App />
);