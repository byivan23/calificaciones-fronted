import React, { useState } from "react";
import Papa from "papaparse";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import "./App.css";

// Registrar los componentes de ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const App = () => {
    const [step, setStep] = useState("home");
    const [selectedCareer, setSelectedCareer] = useState("");
    const [fileData, setFileData] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [professorData, setProfessorData] = useState({
        fullName: "",
        accountNumber: "",
        career: "",
        academicGrade: "",
        username: "",
        password: "",
    });
    const [loggedInProfessor, setLoggedInProfessor] = useState(null);
    const [fileUploadMessage, setFileUploadMessage] = useState("");
    const [isFileUploaded, setIsFileUploaded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [chartData, setChartData] = useState({
        labels: ["Aprobados", "Reprobados"],
        datasets: [
            {
                label: "Cantidad de Estudiantes",
                data: [0, 0],
                backgroundColor: ["#4caf50", "#f44336"],
            },
        ],
    });

    const handleLogin = (e) => {
        e.preventDefault();
        const { username, password } = e.target.elements;

        if (
            username.value === professorData.username &&
            password.value === professorData.password
        ) {
            alert(`Bienvenido/a ${professorData.academicGrade} ${professorData.fullName}`);
            setLoggedInProfessor(professorData);
            setStep("career");
        } else {
            alert("Usuario o contraseña incorrectos.");
        }
    };

    const handleNewProfessor = (e) => {
        e.preventDefault();
        const { fullName, accountNumber, career, academicGrade } = e.target.elements;

        const newProfessor = {
            fullName: fullName.value,
            accountNumber: accountNumber.value,
            career: career.value,
            academicGrade: academicGrade.value,
            username: fullName.value,
            password: accountNumber.value,
        };

        setProfessorData(newProfessor);
        alert("Profesor registrado con éxito");
        setStep("login");
    };

    const handleCareerSelect = (career) => {
        if (loggedInProfessor.career === career) {
            setSelectedCareer(career);
            setStep("upload");
        } else {
            alert("No tiene permisos para acceder a esta carrera.");
        }
    };

    const handleFileUpload = (e) => {
        e.preventDefault();
        const file = e.target.elements[0].files[0];

        if (file) {
            const fileExtension = file.name.split(".").pop().toLowerCase();

            if (fileExtension === "csv") {
                Papa.parse(file, {
                    complete: (result) => {
                        const parsedData = result.data;

                        if (parsedData.length === 40) {
                            setFileData(parsedData);
                            setUploadedFiles([...uploadedFiles, file.name]);
                            setFileUploadMessage("¡Archivo cargado con éxito!");
                            setIsFileUploaded(true);
                            setIsModalOpen(true);
                        } else {
                            setFileUploadMessage(
                                `Advertencia: El archivo debe contener 40 registros. El archivo tiene ${parsedData.length} registros.`
                            );
                        }
                    },
                    header: true,
                    skipEmptyLines: true,
                    delimiter: ",",
                });
            } else {
                setFileUploadMessage("Error: Solo se permiten archivos CSV.");
            }
        } else {
            setFileUploadMessage("No se seleccionó ningún archivo.");
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleSearch = () => {
        const results = fileData.filter((item) =>
            item.Nombre?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(results);

        // Contar los aprobados y reprobados
        const approvedCount = results.filter((item) => parseFloat(item.Total) >= 70).length;
        const failedCount = results.filter((item) => parseFloat(item.Total) < 70).length;

        // Actualizar los datos de la gráfica
        setChartData({
            labels: ["Aprobados", "Reprobados"],
            datasets: [
                {
                    label: "Cantidad de Estudiantes",
                    data: [approvedCount, failedCount],
                    backgroundColor: ["#4caf50", "#f44336"], // Verde para Aprobados, Rojo para Reprobados
                },
            ],
        });

        // Mostrar el mensaje gracioso
        if (approvedCount > 0) {
            alert("¡Apruebas con puro ChatGPT! 🎉 ¡Bien hecho!");
        }
        if (failedCount > 0) {
            alert("¡Uy, parece que necesitas más ChatGPT! 😆 ¡No te rindas!");
        }
    };

    const handleResetFile = () => {
        setFileData([]);
        setUploadedFiles([]);
        setFileUploadMessage("");
        setIsFileUploaded(false);
        setSearchQuery("");
        setSearchResults([]);
        setChartData({
            labels: ["Aprobados", "Reprobados"],
            datasets: [
                {
                    label: "Cantidad de Estudiantes",
                    data: [0, 0],
                    backgroundColor: ["#4caf50", "#f44336"],
                },
            ],
        });
    };

    const handleLogout = () => {
        // Limpiar datos de sesión
        setLoggedInProfessor(null);
        setFileData([]);
        setUploadedFiles([]);
        setFileUploadMessage("");
        setIsFileUploaded(false);
        setSearchQuery("");
        setSearchResults([]);
        setChartData({
            labels: ["Aprobados", "Reprobados"],
            datasets: [
                {
                    label: "Cantidad de Estudiantes",
                    data: [0, 0],
                    backgroundColor: ["#4caf50", "#f44336"],
                },
            ],
        });
        setStep("login");  // Redirigir al login
    };

    return (
        <div className="app-container">
            {step === "home" && (
                <div className="card">
                    <h1>GESTOR TESSFP</h1>
                    <h2>Calificaciones</h2>
                    <button onClick={() => setStep("login")}>Iniciar Sesión</button>
                    <button onClick={() => setStep("newProfessor")}>Nuevo Profesor</button>
                    {loggedInProfessor && (
                        <div className="logged-in-message">
                            <p>
                                Bienvenido/a {loggedInProfessor.academicGrade} {loggedInProfessor.fullName}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {step === "login" && (
                <div className="card">
                    <h1>Login Profesores</h1>
                    <form onSubmit={handleLogin}>
                        <input
                            name="username"
                            type="text"
                            placeholder="Usuario (Nombre Completo)"
                            required
                        />
                        <input
                            name="password"
                            type="password"
                            placeholder="Contraseña (Número de Cuenta)"
                            required
                        />
                        <button type="submit">Iniciar Sesión</button>
                    </form>
                    <button className="back-button" onClick={() => setStep("home")}>
                        Regresar
                    </button>
                </div>
            )}

            {step === "newProfessor" && (
                <div className="card">
                    <h1>Nuevo Profesor</h1>
                    <form onSubmit={handleNewProfessor}>
                        <input
                            name="fullName"
                            type="text"
                            placeholder="Nombre Completo"
                            required
                        />
                        <input
                            name="accountNumber"
                            type="text"
                            placeholder="Número de Cuenta"
                            required
                        />
                        <label htmlFor="career">Carrera</label>
                        <select name="career" required>
                            <option value="Ingeniería Informática">Ingeniería Informática</option>
                            <option value="Ingeniería en Industrias Alimentarias">
                                Ingeniería en Industrias Alimentarias
                            </option>
                            <option value="Ingeniería Química">Ingeniería Química</option>
                            <option value="Ingeniería Civil">Ingeniería Civil</option>
                            <option value="Ingeniería en Energías Renovables">
                                Ingeniería en Energías Renovables
                            </option>
                            <option value="Contador Público">Contador Público</option>
                        </select>
                        <label htmlFor="academicGrade">Grado Académico</label>
                        <select name="academicGrade" required>
                            <option value="Ingeniero/a">Ingeniero/a</option>
                            <option value="Doctor/a">Doctor/a</option>
                            <option value="Maestro/a">Maestro/a</option>
                        </select>
                        <button type="submit">Registrar Profesor</button>
                    </form>
                    <button className="back-button" onClick={() => setStep("home")}>Regresar</button>
                </div>
            )}

            {step === "career" && (
                <div className="card">
                    <h1>Seleccionar Carrera</h1>
                    <p>
                        Bienvenido/a {loggedInProfessor.academicGrade} {loggedInProfessor.fullName}
                    </p>
                    <button onClick={() => handleCareerSelect("Ingeniería Informática")}>
                        Ingeniería Informática
                    </button>
                    <button
                        onClick={() => handleCareerSelect("Ingeniería en Industrias Alimentarias")}>
                        Ingeniería en Industrias Alimentarias
                    </button>
                    <button onClick={() => handleCareerSelect("Ingeniería Química")}>
                        Ingeniería Química
                    </button>
                    <button onClick={() => handleCareerSelect("Ingeniería Civil")}>Ingeniería Civil</button>
                    <button
                        onClick={() => handleCareerSelect("Ingeniería en Energías Renovables")}>
                        Ingeniería en Energías Renovables
                    </button>
                    <button onClick={() => handleCareerSelect("Contador Público")}>Contador Público</button>
                    <button className="back-button" onClick={handleLogout}>Cerrar Sesión</button>
                </div>
            )}

            {step === "upload" && (
                <div className="card">
                    <h1>Cargar Archivo</h1>
                    <form onSubmit={handleFileUpload}>
                        <input type="file" accept=".csv" required />
                        <button type="submit">Subir archivo</button>
                    </form>
                    <p>{fileUploadMessage}</p>
                    {isFileUploaded && (
                        <div>
                            <h2>Archivo Subido: {uploadedFiles.join(", ")}</h2>
                            <input
                                type="text"
                                placeholder="Buscar por Nombre"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button onClick={handleSearch}>Buscar por Nombre</button>
                            <button onClick={() => {
                                setSearchQuery("");  // Limpiar la búsqueda
                                setSearchResults([]); // Limpiar los resultados de búsqueda
                            }} >
                                Resetear
                            </button>
                            <button onClick={handleResetFile}>Resetear Archivo</button>
                            {searchResults.length > 0 && (
                                <div>
                                    <h2>Gráfica de Aprobados y Reprobados</h2>
                                    <Bar data={chartData} options={{ responsive: true }} />
                                </div>
                            )}
                            {searchResults.length > 0 ? (
                                <table>
                                    <thead>
                                    <tr>
                                        {Object.keys(searchResults[0]).map((header, index) => (
                                            <th key={index}>{header}</th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {searchResults.map((result, index) => (
                                        <tr key={index}>
                                            {Object.values(result).map((value, idx) => (
                                                <td key={idx}>{value}</td>
                                            ))}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>No se encontraron resultados.</p>
                            )}
                        </div>
                    )}
                    <button className="back-button" onClick={() => setStep("career")}>Regresar</button>
                </div>
            )}

            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
                        <h2>Información del Archivo Cargado</h2>
                        <div
                            className="table-container"
                            style={{ maxHeight: "400px", overflowY: "auto" }}
                        >
                            <table>
                                <thead>
                                <tr>
                                    {fileData.length > 0 &&
                                        Object.keys(fileData[0]).map((header, index) => (
                                            <th key={index}>{header}</th>
                                        ))}
                                </tr>
                                </thead>
                                <tbody>
                                {fileData.map((item, index) => (
                                    <tr key={index}>
                                        {Object.values(item).map((value, idx) => (
                                            <td key={idx}>{value}</td>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <button className="back-button" onClick={closeModal}>Regresar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
