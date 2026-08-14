import re

with open('d:\\anitigravity_mock_test\\frontend\\src\\pages\\admin\\LearningManagement.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add drag and drop states and handlers inside LearningManagement component
drag_drop_handlers = '''
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [draggedOverItemIndex, setDraggedOverItemIndex] = useState(null);

  const handleDragStart = (e, index, currentLevel) => {
    if (currentLevel !== 'Lesson') return;
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // For visual effect
    e.dataTransfer.setData("text/html", e.target.parentNode);
    e.dataTransfer.setDragImage(e.target, 20, 20);
  };

  const handleDragEnter = (e, index, currentLevel) => {
    e.preventDefault();
    if (currentLevel !== 'Lesson') return;
    if (draggedItemIndex !== null && draggedItemIndex !== index) {
      setDraggedOverItemIndex(index);
      
      const newItems = [...lessons];
      const draggedItem = newItems[draggedItemIndex];
      newItems.splice(draggedItemIndex, 1);
      newItems.splice(index, 0, draggedItem);
      
      setDraggedItemIndex(index);
      setLessons(newItems);
    }
  };

  const handleDragEnd = async (currentLevel) => {
    if (currentLevel !== 'Lesson') return;
    setDraggedItemIndex(null);
    setDraggedOverItemIndex(null);
    
    const updatedOrder = lessons.map((l, index) => ({ id: l.id, order_index: index }));
    try {
      await learningApi.reorderLessons({ items: updatedOrder });
    } catch (err) {
      console.error('Failed to save lesson order', err);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };
'''

# Insert the handlers before useEffect
code = code.replace(
    '  const [loading, setLoading] = useState(true);\n\n  useEffect(() => {',
    '  const [loading, setLoading] = useState(true);\n' + drag_drop_handlers + '\n  useEffect(() => {'
)

# Update the renderColumn function to include drag and drop props on the lesson items
old_render_item = '''          items.map(item => (
            <div 
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`group flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                selectedItem === item.id 
                  ? 'bg-brand-50 border-brand-200 dark:bg-brand-500/20 dark:border-brand-500/30 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] scale-[1.02]' 
                  : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-4 flex-1 overflow-hidden">'''

new_render_item = '''          items.map((item, index) => (
            <div 
              key={item.id}
              onClick={() => onSelect(item.id)}
              draggable={currentLevel === 'Lesson'}
              onDragStart={(e) => handleDragStart(e, index, currentLevel)}
              onDragEnter={(e) => handleDragEnter(e, index, currentLevel)}
              onDragEnd={() => handleDragEnd(currentLevel)}
              onDragOver={handleDragOver}
              className={`group flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                selectedItem === item.id 
                  ? 'bg-brand-50 border-brand-200 dark:bg-brand-500/20 dark:border-brand-500/30 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] scale-[1.02]' 
                  : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700'
              } ${draggedItemIndex === index ? 'opacity-50' : 'opacity-100'} ${draggedOverItemIndex === index ? 'border-brand-500 dark:border-brand-400' : ''}`}
            >
              <div className="flex items-center gap-4 flex-1 overflow-hidden">
                {currentLevel === 'Lesson' && (
                  <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400">
                    <svg width="14" height="20" viewBox="0 0 14 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="5" cy="4" r="2"/>
                      <circle cx="9" cy="4" r="2"/>
                      <circle cx="5" cy="10" r="2"/>
                      <circle cx="9" cy="10" r="2"/>
                      <circle cx="5" cy="16" r="2"/>
                      <circle cx="9" cy="16" r="2"/>
                    </svg>
                  </div>
                )}'''

code = code.replace(old_render_item, new_render_item)

with open('d:\\anitigravity_mock_test\\frontend\\src\\pages\\admin\\LearningManagement.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done updating LearningManagement.jsx')
