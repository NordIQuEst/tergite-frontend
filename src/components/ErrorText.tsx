export default function ErrorText({ text, className = '' }: Props) {
	return <div className={`h-full w-full text-red-700 ${className}`}>{text}</div>;
}

interface Props {
	text: string;
	className?: string;
}
