import { icon } from "./icon";

type AlertProps = {
    display: boolean;
    type: "error" | "warning" | "success" | "info";
    message: string;
};

function Alert({ type , display, message}: AlertProps) {
    return (
        // ${display ? "" : "hidden"}
        <div role="alert" className={`alert alert-${type} mb-4 ${display ? "" : "hidden"}`}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={icon[type]}
                />
            </svg>
            <span>{message}</span>
        </div>
    );
}

export default Alert;
