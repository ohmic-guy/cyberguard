from __future__ import annotations

import argparse
from pathlib import Path

import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms

ROOT = Path(__file__).resolve().parents[3]
DATASET_DIR = ROOT / "data" / "deepfake" / "image"
MODEL_PATH = ROOT / "data" / "models" / "deepfake_image.pth"


def select_device(requested: str) -> torch.device:
	if requested == "cuda" and not torch.cuda.is_available():
		raise RuntimeError("CUDA was requested but torch.cuda.is_available() is false")
	if requested == "auto":
		return torch.device("cuda" if torch.cuda.is_available() else "cpu")
	return torch.device(requested)


def train(epochs: int, batch_size: int, requested_device: str) -> None:
	device = select_device(requested_device)
	print(f"Training on {device}")
	if device.type == "cuda":
		print(f"GPU: {torch.cuda.get_device_name(device)}")

	transform = transforms.Compose([
		transforms.Resize((224, 224)),
		transforms.ToTensor(),
		transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
	])
	dataset = datasets.ImageFolder(DATASET_DIR, transform=transform)
	loader = DataLoader(
		dataset,
		batch_size=batch_size,
		shuffle=True,
		num_workers=0,
		pin_memory=device.type == "cuda",
	)

	model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
	model.classifier[1] = nn.Linear(model.classifier[1].in_features, len(dataset.classes))
	model.to(device)
	optimizer = torch.optim.Adam(model.parameters(), lr=1e-4)
	criterion = nn.CrossEntropyLoss()

	for epoch in range(epochs):
		model.train()
		total_loss = 0.0
		correct = 0
		for images, labels in loader:
			images = images.to(device, non_blocking=device.type == "cuda")
			labels = labels.to(device, non_blocking=device.type == "cuda")
			optimizer.zero_grad(set_to_none=True)
			outputs = model(images)
			loss = criterion(outputs, labels)
			loss.backward()
			optimizer.step()
			total_loss += loss.item()
			correct += int((outputs.argmax(1) == labels).sum())
		print(f"epoch={epoch + 1}/{epochs} loss={total_loss / len(loader):.4f} accuracy={correct / len(dataset):.4f}")

	MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
	torch.save({"state_dict": model.state_dict(), "classes": dataset.classes}, MODEL_PATH)
	print(f"Saved {MODEL_PATH}")


if __name__ == "__main__":
	parser = argparse.ArgumentParser()
	parser.add_argument("--device", choices=("auto", "cuda", "cpu"), default="auto")
	parser.add_argument("--epochs", type=int, default=5)
	parser.add_argument("--batch-size", type=int, default=32)
	args = parser.parse_args()
	train(args.epochs, args.batch_size, args.device)