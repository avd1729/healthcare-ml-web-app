import os, pickle
try:
    import fastapi
    print('fastapi OK', getattr(fastapi, '__version__', 'unknown'))
except Exception as e:
    print('fastapi import error:', e)

p = os.path.join('model','model.pkl')
print('model path:', p)
if os.path.exists(p):
    try:
        with open(p,'rb') as f:
            m = pickle.load(f)
        print('model load OK, type=', type(m))
    except Exception as e:
        print('model load error:', e)
else:
    print('model file not found at', p)
