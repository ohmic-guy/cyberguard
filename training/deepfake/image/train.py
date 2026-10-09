import os
import time
import json
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix

SEED = 42
torch.manual_seed(SEED)

def get_transforms():
    return transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

def evaluate_model(model, dataloader, device):
    model.eval()
    all_preds = []
    all_labels = []
    
    with torch.no_grad():
        for inputs, labels in dataloader:
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())
            
    return all_labels, all_preds

def train_model():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    data_dir = os.path.join(base_dir, 'backend', 'data', 'deepfake', 'image')
    train_dir = os.path.join(data_dir, 'train')
    test_dir = os.path.join(data_dir, 'test')
    
    if not os.path.exists(train_dir) or not os.path.exists(test_dir):
        raise ValueError(f"Dataset not found at {data_dir}")
        
    transform = get_transforms()
    
    train_dataset = datasets.ImageFolder(train_dir, transform=transform)
    test_dataset = datasets.ImageFolder(test_dir, transform=transform)
    
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True, num_workers=0)
    test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False, num_workers=0)
    
    class_names = train_dataset.classes
    print(f"Classes: {class_names}")
    
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    # Load EfficientNet pre-trained
    model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
    
    # Freeze backbone
    for param in model.parameters():
        param.requires_grad = False
        
    # Replace head
    num_ftrs = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_ftrs, len(class_names))
    model = model.to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.classifier.parameters(), lr=0.001)
    
    epochs = 2 # Keeping it small for demonstration/quick run
    
    print("Starting training...")
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        
        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item() * inputs.size(0)
            
        epoch_loss = running_loss / len(train_dataset)
        print(f"Epoch {epoch+1}/{epochs} Loss: {epoch_loss:.4f}")
        
    # Evaluate
    print("Evaluating model...")
    all_labels, all_preds = evaluate_model(model, test_loader, device)
    
    accuracy = accuracy_score(all_labels, all_preds)
    precision = precision_score(all_labels, all_preds, average='weighted')
    recall = recall_score(all_labels, all_preds, average='weighted')
    f1 = f1_score(all_labels, all_preds, average='weighted')
    
    print(f"Accuracy: {accuracy:.4f}")
    print(classification_report(all_labels, all_preds, target_names=class_names))
    
    # Save model and metadata
    models_dir = os.path.join(base_dir, 'backend', 'data', 'models', 'deepfake')
    os.makedirs(models_dir, exist_ok=True)
    
    model_path = os.path.join(models_dir, 'efficientnet_v1.pth')
    torch.save(model.state_dict(), model_path)
    
    metadata = {
        "model_name": "EfficientNet-B0 Deepfake Image",
        "version": "v1",
        "dataset_name": "deepfake_image",
        "training_date": time.strftime("%Y-%m-%d %H:%M:%S"),
        "metrics": {
            "accuracy": float(accuracy),
            "precision": float(precision),
            "recall": float(recall),
            "f1_score": float(f1)
        },
        "framework": "PyTorch",
        "input_format": "Image 224x224 RGB",
        "output_labels": class_names
    }
    
    metadata_path = os.path.join(models_dir, 'efficientnet_v1_metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=4)
        
    print(f"Model saved to {model_path}")
    print(f"Metadata saved to {metadata_path}")

if __name__ == '__main__':
    train_model()
