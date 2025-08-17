import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


interface Props {
	buttonText: string;
	buttonStyle?: string;
	open?: boolean;
	onClose?: () => void;
	onSubmit?: (info: {
		firstName: string;
		lastName: string;
		email: string;
		veteranStatus: string;
	}) => void;
}

export const UserInfoDialog = (
	{ buttonText, buttonStyle, open, onClose, onSubmit }: Props = { buttonText: "See Results" },
) => {
	const [internalOpen, setInternalOpen] = useState(false);
	const isOpen = open !== undefined ? open : internalOpen;
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [veteranStatus, setVeteranStatus] = useState("");
	const [acknowledge, setAcknowledge] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [message, setMessage] = useState<{
		text: string;
		type: "success" | "error";
	} | null>(null);

		const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			setIsLoading(true);
			setMessage(null);

			if (!acknowledge) {
				setMessage({ text: "Please acknowledge email capture.", type: "error" });
				setIsLoading(false);
				return;
			}

			if (onSubmit) {
				await onSubmit({ firstName, lastName, email, veteranStatus });
				setIsLoading(false);
				if (onClose) onClose();
				setInternalOpen(false);
				return;
			}
			setIsLoading(false);
		};

		return (
			<Dialog open={isOpen} onOpenChange={open !== undefined ? onClose : setInternalOpen}>
				{!open && (
					<DialogTrigger asChild>
						<Button className={buttonStyle}>{buttonText}</Button>
					</DialogTrigger>
				)}
				<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="text-3xl pb-4">See Results</DialogTitle>
					<DialogDescription className="font-display">
						Please enter your information to view your survey results.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="firstName" className="text-right">
								First Name
							</Label>
							<Input
								id="firstName"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								className="col-span-3"
								required
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="lastName" className="text-right">
								Last Name
							</Label>
							<Input
								id="lastName"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								className="col-span-3"
								required
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="email" className="text-right">
								Email
							</Label>
							<Input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="col-span-3"
								required
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="veteranStatus" className="text-right">
								Veteran Status
							</Label>
							<select
								id="veteranStatus"
								value={veteranStatus}
								onChange={(e) => setVeteranStatus(e.target.value)}
								className="col-span-3 border rounded px-2 py-1"
								required
							>
								<option value="">Select...</option>
								<option value="Active Military">Active Military</option>
								<option value="Veteran">Veteran</option>
								<option value="Civilian">Civilian</option>
							</select>
						</div>
						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="acknowledge"
								checked={acknowledge}
								onChange={(e) => setAcknowledge(e.target.checked)}
								required
							/>
							<Label htmlFor="acknowledge">
								I acknowledge my email will be captured for research purposes.
							</Label>
						</div>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? "Submitting..." : "See Results"}
						</Button>
					</DialogFooter>
				</form>
				{message && (
					<div
						className={`mt-4 text-center ${
							message.type === "success" ? "text-green-600" : "text-red-600"
						}`}
						role="alert"
						aria-live="polite"
					>
						{message.text}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};
